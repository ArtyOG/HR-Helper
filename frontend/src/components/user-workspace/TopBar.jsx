import UserMenu from '../common/UserMenu';

function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3">
      <h1 className="font-sans text-[26px] font-bold leading-none tracking-tight text-[#344e41]">
        Dashboard
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <UserMenu />
      </div>
    </div>
  );
}

export default TopBar;