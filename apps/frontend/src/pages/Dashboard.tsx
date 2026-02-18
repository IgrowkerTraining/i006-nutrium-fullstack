import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Button } from "../components/common/Button";
import { getAIGreeting } from "../services/service";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/layout/Header";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState<string>("Loading greeting...");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [stats] = useState([
    { label: "Cloud Storage", value: "1.2 TB", icon: "☁️" },
    { label: "Active Sessions", value: "4", icon: "💻" },
    { label: "Security Score", value: "98%", icon: "🛡️" },
    { label: "Network Speed", value: "850 Mbps", icon: "⚡" },
  ]);

  useEffect(() => {
    const initDashboard = async () => {
      const [msg, online] = await Promise.all([
        getAIGreeting(user?.name || ""),
        api.checkHealth(),
      ]);
      setGreeting(msg);
      setIsBackendOnline(online);
    };
    initDashboard();
  }, [user?.name]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isBackendOnline={isBackendOnline} user={user} logout={logout}/>


      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">{greeting}</h2>
          <p className="text-slate-400">
            Everything looks optimal in your workspace today.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-white">System Logs</h3>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              {[
                {
                  action: "New login detected",
                  location: "San Francisco, US",
                  time: "2 mins ago",
                  status: "secure",
                },
                {
                  action: "Database sync",
                  location: "Global-Edge-01",
                  time: "1 hour ago",
                  status: "success",
                },
                {
                  action: "Security patch applied",
                  location: "Auto-update",
                  time: "3 hours ago",
                  status: "success",
                },
                {
                  action: "Password rotation reminder",
                  location: "User node",
                  time: "5 hours ago",
                  status: "pending",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${log.status === "secure" || log.status === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {log.action}
                      </p>
                      <p className="text-xs text-slate-500">{log.location}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-semibold text-white">
              Identity Insight
            </h3>
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={user.avatar}
                  className="w-16 h-16 rounded-2xl"
                  alt=""
                />
                <div>
                  <h4 className="font-bold text-white text-lg">{user.name}</h4>
                  <p className="text-indigo-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Account ID</span>
                  <span className="text-slate-200 font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Encryption Level</span>
                  <span className="text-emerald-400 font-bold">SHA-512</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Member Since</span>
                  <span className="text-slate-200">Feb 2024</span>
                </div>
              </div>
              <Button variant="primary" className="w-full mt-6">
                Edit Profile
              </Button>
            </div>
          </section>
        </div>
      </main>

      <div className="sm:hidden sticky bottom-0 p-4 bg-slate-950 border-t border-slate-800">
        <Button variant="outline" className="w-full" onClick={logout}>
          Log Out of Nexus
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
