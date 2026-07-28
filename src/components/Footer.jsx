import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 p-4 text-center text-xs text-slate-500">
      EduTrack Pro © {new Date().getFullYear()} — Dashboard Framework Team
    </footer>
  );
}