import Navbar from '../user-workspace/Navbar';

function WorkspaceShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[#fffef9] font-sans text-stone-800 antialiased">
      <Navbar />
      <main className="min-w-0 flex-1 px-5 pb-10 pt-24 sm:px-8 lg:ml-[297px] lg:pt-10">
        <div className="mx-auto w-full max-w-site">{children}</div>
      </main>
    </div>
  );
}

export default WorkspaceShell;