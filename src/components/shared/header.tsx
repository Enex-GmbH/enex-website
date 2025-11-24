"use client";

import { Navigation } from "../ui/nav";

const Header = () => {
  return (
    <header className="shadow-md py-4">
      <div className="container mx-auto">
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
