from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.model_service import (
    process_cv,
    download_pdf,
    extract_text_from_pdf,
    preprocess_text,
)

api_router = APIRouter()


# ── Request schemas ────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    pdf_url: str
    job_requirements: str


class ExtractRequest(BaseModel):
    pdf_url: str


class BulkRecommendRequest(BaseModel):
    pdf_urls: list[str]
    job_requirements: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@api_router.get("/v1/status", tags=["system"])
def status() -> dict[str, str]:
    return {"status": "ready"}


@api_router.post("/v1/extract", tags=["debug"])
def extract(request: ExtractRequest) -> dict:
    """
    Debug endpoint — extract and return raw + cleaned text from a PDF.
    """
    try:
        pdf_bytes = download_pdf(request.pdf_url)
        raw_text = extract_text_from_pdf(pdf_bytes)

        if not raw_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from PDF. The file may be scanned or image-based."
            )

        cleaned_text = preprocess_text(raw_text)

        return {
            "success": True,
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")


@api_router.post("/v1/recommend", tags=["recommendation"])
def recommend(request: RecommendRequest) -> dict:
    """
    Score a single CV against job requirements.
    Returns a match score from 0 to 100.
    """
    try:
        result = process_cv(
            pdf_url=request.pdf_url,
            job_requirements=request.job_requirements,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")

    if not result["success"]:
        raise HTTPException(status_code=422, detail=result["error"])

    return {
        "success": True,
        "score": result["score"],
    }


@api_router.post("/v1/recommend/bulk", tags=["recommendation"])
def recommend_bulk(request: BulkRecommendRequest) -> dict:
    """
    Score multiple CVs against the same job requirements.
    Returns all candidates ranked highest score first.
    """
    if not request.pdf_urls:
        raise HTTPException(status_code=400, detail="No PDF URLs provided.")

    rankings = []

    for pdf_url in request.pdf_urls:
        try:
            result = process_cv(
                pdf_url=pdf_url,
                job_requirements=request.job_requirements,
            )
            rankings.append({
                "pdf_url": pdf_url,
                "score": result["score"] if result["success"] else 0.0,
                "error": None if result["success"] else result.get("error"),
            })
        except Exception as e:
            # Don't fail entire request if one CV fails
            rankings.append({
                "pdf_url": pdf_url,
                "score": 0.0,
                "error": str(e),
            })

    # Sort highest score first
    rankings.sort(key=lambda x: x["score"], reverse=True)

    # Add rank number
    for i, item in enumerate(rankings):
        item["rank"] = i + 1

    return {
        "success": True,
        "total": len(rankings),
        "job_requirements": request.job_requirements,
        "rankings": rankings,
    }