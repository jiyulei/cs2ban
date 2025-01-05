import Navbar from "./Navbar";
import React from "react";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
}
