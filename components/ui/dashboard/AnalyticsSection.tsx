"use client";

import React from "react";
import { GraduationCap, Globe, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsSectionProps {
  analytics: {
    todayCount: number;
    avgProgress: number;
    ageGroupData: { name: string; value: number; color: string }[];
    languageData: { name: string; value: number }[];
    trendData: { date: string; count: number }[];
  };
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  analytics,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Age Demographics */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col h-64">
        <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center mb-4">
          <GraduationCap className="w-4 h-4 mr-2 text-blue-600" /> Age
          Distribution
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.ageGroupData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "bold",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                {analytics.ageGroupData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[8px] font-black uppercase text-gray-400">
          {analytics.ageGroupData.map((g) => (
            <div key={g.name} className="flex items-center">
              <span
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: g.color }}
              />
              {g.name.split(" ")[0]}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Preferred Languages */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col h-64 text-gray-900">
        <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center mb-4">
          <Globe className="w-4 h-4 mr-2 text-indigo-600" /> Language Mix
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.languageData}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.languageData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"][
                        i % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] font-black text-gray-400 uppercase mt-2">
          {analytics.languageData[0]?.name || "No Data"} is Top
        </p>
      </div>

      {/* 3. Registration Trend */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col h-64 lg:col-span-2 text-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-600" /> Registration
            Trend
          </h3>
          <div className="text-right">
            <span className="text-xl font-black text-green-600">
              {analytics.todayCount}
            </span>
            <span className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Today
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="date" hide />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Avg. Completion
            </p>
            <p className="text-lg font-black text-blue-600">
              {analytics.avgProgress}%
            </p>
          </div>
          {/* <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">P</div>
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
};
