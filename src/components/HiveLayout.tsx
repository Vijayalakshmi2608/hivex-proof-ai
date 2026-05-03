import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

export const HiveLayout = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const links = [
    { to: "/dashboard", label: "Verify" },
    { to: "/judge", label: "Judge Mode" },
    { to: "/passport", label: "Passport" },
  ];
  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[600px]" style={{ background: "var(--gradient-glow)" }} />
      <header className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-background/40">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 60 }} className="text-primary">
              <Hexagon className="w-7 h-7 fill-primary/20 stroke-primary" strokeWidth={2} />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight">
              Hive<span className="text-gradient">X</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <motion.main
        key={loc.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
};