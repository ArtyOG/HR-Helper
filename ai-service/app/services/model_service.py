
import io
import re

import httpx
import pdfplumber
from sentence_transformers import SentenceTransformer, util

from app.core.config import settings

# Load the sentence-transformers model once when the service starts
print(f"Loading model: {settings.model_name} ...")
model = SentenceTransformer(settings.model_name)
print("Model loaded and ready.")


# ── Text preprocessing ─────────────────────────────────────────────────────────

NO_SPACE_FIXES: dict[str, str] = {
    "machinelearning": "machine learning",
    "deeplearning": "deep learning",
    "naturallanguageprocessing": "natural language processing",
    "computervision": "computer vision",
    "javascript": "java script",
    "typescript": "type script",
    "nodejs": "node js",
    "reactjs": "react js",
    "vuejs": "vue js",
    "nextjs": "next js",
    "postgresql": "postgres sql",
    "mongodb": "mongo db",
    "github": "git hub",
    "devops": "dev ops",
    "fullstack": "full stack",
    "frontend": "front end",
    "backend": "back end",
}


def preprocess_text(text: str) -> str:
    """
    Clean up raw CV text before feeding into the model.
    No autocorrect — it breaks tech tool names like Docker, Figma, Vercel.
    """
    # 1. Lowercase
    text = text.lower()

    # 2. Fix known no-space tech terms
    for wrong, correct in NO_SPACE_FIXES.items():
        text = text.replace(wrong, correct)

    # 3. Split camelCase → camel case
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)

    # 4. Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ── Chunking ───────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = 200, overlap: int = 100) -> list[str]:
    """
    Split CV text into overlapping chunks of 200 words with 100 word overlap.

    Example for 500 word CV:
      Chunk 0: words 0   → 200
      Chunk 1: words 100 → 300  (100 word overlap)
      Chunk 2: words 200 → 400  (100 word overlap)
      Chunk 3: words 300 → 500  (100 word overlap)
    """
    words = text.split()

    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


# ── Skills section extraction ──────────────────────────────────────────────────

def extract_skills_section(text: str) -> str:
    """
    Extract skills section from CV text.
    Works on both multiline and single line text.
    Falls back to full text if no skills section found.
    """
    text_lower = text.lower()

    start_keywords = ["skill", "expertise", "technology", "tools"]
    end_keywords   = ["experience", "education", "project", "work", "certification"]

    start_idx = -1
    for kw in start_keywords:
        idx = text_lower.find(kw)
        if idx != -1:
            start_idx = idx
            break

    if start_idx == -1:
        return text

    end_idx = len(text)
    for kw in end_keywords:
        idx = text_lower.find(kw, start_idx + 10)
        if idx != -1 and idx < end_idx:
            end_idx = idx

    skills_text = text[start_idx:end_idx].strip()
    return skills_text if skills_text else text


# ── Summary chunk ──────────────────────────────────────────────────────────────

def extract_summary_chunk(text: str) -> str:
    """
    Build a global summary chunk from:
    - First 75 words (name, title, summary)     ← increased from 50
    - Full skills section (most important)
    - Last 75 words (education, certifications) ← increased from 50

    Larger window captures more context so job titles and
    summaries are included alongside skills.
    """
    words = text.split()
    start  = " ".join(words[:75])   # increased from 50 → 75
    skills = extract_skills_section(text)
    end    = " ".join(words[-75:])  # increased from 50 → 75
    return f"{start} {skills} {end}"


# ── New Scoring Components ────────────────────────────────────────────────────────

def calculate_experience_score(cv_text: str, job_req: str) -> float:
    """Extract years of experience and compare against job requirements."""
    # Find all mentions of years of experience (e.g., "5 years", "3+ years")
    cv_years = [int(y) for y in re.findall(r'(\d+)\+?\s*years?', cv_text.lower())]
    job_years = [int(y) for y in re.findall(r'(\d+)\+?\s*years?', job_req.lower())]
    
    if not job_years:
        return 100.0  # Job doesn't specify years of experience, give full points

    req_years = max(job_years)
    max_cv_years = max(cv_years) if cv_years else 0
    
    if max_cv_years >= req_years:
        return 100.0
    elif max_cv_years > 0:
        return (max_cv_years / req_years) * 100
    return 0.0

def extract_education_section(text: str) -> str:
    """Extract education section using common keywords."""
    text_lower = text.lower()
    start_keywords = ["education", "academic", "degree", "university", "college"]
    end_keywords = ["experience", "skill", "project", "work", "certification", "summary"]
    
    start_idx = -1
    for kw in start_keywords:
        idx = text_lower.find(kw)
        if idx != -1:
            start_idx = idx
            break
            
    if start_idx == -1:
        return ""
        
    end_idx = len(text)
    for kw in end_keywords:
        idx = text_lower.find(kw, start_idx + 10)
        if idx != -1 and idx < end_idx:
            end_idx = idx
            
    return text[start_idx:end_idx].strip()

def calculate_education_score(cv_text: str, job_embedding, model) -> float:
    """Score the education section against the job requirements."""
    edu_text = extract_education_section(cv_text)
    if not edu_text:
        # Fallback: check if standard degrees are mentioned anywhere
        if any(deg in cv_text.lower() for deg in ["bachelor", "master", "phd", "degree", "b.s", "m.s", "bsc", "msc"]):
            edu_text = cv_text
        else:
            return 50.0  # Neutral score if absolutely no education found
            
    edu_embedding = model.encode(edu_text, convert_to_tensor=True)
    score = float(util.cos_sim(edu_embedding, job_embedding)[0][0]) * 100
    return max(0.0, score)

def calculate_keyword_boost(cv_text: str, job_req: str) -> float:
    """Bonus score for exactly matching common tech keywords found in the job req."""
    # A base list of common tech keywords + our pre-processing ones
    tech_keywords = list(NO_SPACE_FIXES.values()) + [
        "python", "java", "c++", "c#", "ruby", "php", "sql", "aws", "azure", 
        "gcp", "docker", "kubernetes", "agile", "scrum", "git", "linux", "api", "rest"
    ]
    
    req_words = set(job_req.lower().replace(",", " ").replace(".", " ").split())
    # Which of these tech words actually appear in the job requirement?
    required_tech = [kw for kw in tech_keywords if kw in req_words or kw.replace(" ", "") in req_words]
    
    if not required_tech:
        return 100.0  # No specific known keywords to boost, give full points
        
    cv_lower = cv_text.lower()
    matches = sum(1 for kw in required_tech if kw in cv_lower or kw.replace(" ", "") in cv_lower)
    
    return (matches / len(required_tech)) * 100


# ── Scoring ────────────────────────────────────────────────────────────────────

def compute_score(cv_text: str, job_requirements: str) -> float:
    """
    Score CV against job requirements.

    Strategy:
    1. Split CV into overlapping chunks (200 words, 100 overlap)
    2. Add a summary chunk (global view of entire CV)
    3. Compare every chunk against the full job requirement sentence
    4. Sort scores, take top 3 average (stable result)
    5. Score skills section separately
    6. Extract and score Experience, Education, and exact Keywords
    7. Combine all using weighted formula
    """
    # Encode job requirements once
    job_embedding = model.encode(job_requirements, convert_to_tensor=True)

    # Build all chunks + summary chunk
    chunks    = chunk_text(cv_text)
    summary   = extract_summary_chunk(cv_text)
    all_chunks = chunks + [summary]

    # Score every chunk against job requirements
    scores = []
    for chunk in all_chunks:
        chunk_embedding = model.encode(chunk, convert_to_tensor=True)
        score = float(util.cos_sim(chunk_embedding, job_embedding)[0][0]) * 100
        scores.append(score)

    # Top 3 average for stability
    scores.sort(reverse=True)
    top_3      = scores[:3]
    full_score = sum(top_3) / len(top_3)

    # Score skills section separately
    skills_text      = extract_skills_section(cv_text)
    skills_embedding = model.encode(skills_text, convert_to_tensor=True)
    skills_score     = float(util.cos_sim(skills_embedding, job_embedding)[0][0]) * 100

    # --- NEW COMPONENTS ---
    exp_score = calculate_experience_score(cv_text, job_requirements)
    edu_score = calculate_education_score(cv_text, job_embedding, model)
    keyword_boost = calculate_keyword_boost(cv_text, job_requirements)

    # New weights (Job title removed):
    # Overall chunks: 25%
    # Skills section: 50%
    # Experience:     10%
    # Education:      10%
    # Keyword Boost:   5%
    final_score = (full_score * 0.25) + (skills_score * 0.50) + (exp_score * 0.10) + (edu_score * 0.10) + (keyword_boost * 0.05)

    return round(final_score, 2)


# ── PDF handling ───────────────────────────────────────────────────────────────

def download_pdf(url: str) -> bytes:
    """Download a PDF from a URL and return raw bytes."""
    response = httpx.get(url, timeout=30)
    response.raise_for_status()
    return response.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from PDF bytes using pdfplumber."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


# ── Main service function ──────────────────────────────────────────────────────

def process_cv(pdf_url: str, job_requirements: str) -> dict:
    """
    Download a CV PDF, extract text, clean it, and score it
    against the provided job requirements.
    """
    # Step 1: Download PDF
    pdf_bytes = download_pdf(pdf_url)

    # Step 2: Extract raw text
    raw_text = extract_text_from_pdf(pdf_bytes)

    if not raw_text.strip():
        return {
            "success": False,
            "error": "Could not extract text from PDF. The file may be scanned or image-based.",
            "score": 0.0,
        }

    # Step 3: Preprocess CV text
    cleaned_text = preprocess_text(raw_text)

    # Step 4: Score CV against job requirements
    score = compute_score(cleaned_text, job_requirements)

    return {
        "success": True,
        "score": score,
        "cleaned_text": cleaned_text,
    }