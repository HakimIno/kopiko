"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { DottedSeparator } from "@/components/dotted-separator";

const TABS = ['Overview', 'Projects', 'Tasks', 'Members', 'Settings'];

export function WorkspaceContent() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card className="p-6">
      <div className="flex items-center gap-6 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className={cn(
              "font-medium hover:text-[#D69D78]",
              activeTab === tab.toLowerCase() && "text-[#D69D78]"
            )}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </Button>
        ))}
      </div>

      <DottedSeparator dotSize="2px" gapSize="2px" className="mb-6" />

      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Projects</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            {[1, 2, 3].map((project) => (
              <Card key={project} className="p-4 border-[#D69D78]/10 hover:border-[#D69D78]/80 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D69D78]/10 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-[#D69D78]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Project {project}</h4>
                      <p className="text-sm text-muted-foreground">8 tasks pending</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((activity) => (
                <div key={activity} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D69D78]/10 flex items-center justify-center text-[#D69D78]">
                    U
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">User {activity}</span> completed a task
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
} 