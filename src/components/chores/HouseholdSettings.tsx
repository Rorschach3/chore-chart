import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile, Household } from "./types";

interface HouseholdSettingsProps {
  household: Household | undefined;
  members: Profile[];
  isManager: boolean;
  currentUserId: string;
  onUpdateSettings: (settings: { managerId?: string; rotationInterval?: Household["rotation_interval"] }) => void;
}

export function HouseholdSettings({
  household,
  members,
  isManager,
  currentUserId,
  onUpdateSettings,
}: HouseholdSettingsProps) {
  if (!household) return null;

  const managerProfile = members.find(m => m.id === household.manager_id);
  const currentUserProfile = members.find(m => m.id === currentUserId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Settings</CardTitle>
        <CardDescription>
          Manage chore rotation settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">House Manager</div>
          {isManager ? (
            <Select
              value={household.manager_id || ""}
              onValueChange={(value) => onUpdateSettings({ managerId: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name || member.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {managerProfile ? (
                  managerProfile.full_name || managerProfile.username
                ) : (
                  "No manager assigned"
                )}
              </div>
              {!household.manager_id && currentUserProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateSettings({ managerId: currentUserId })}
                >
                  Become House Manager
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Rotation Interval</div>
          {isManager ? (
            <Select
              value={household.rotation_interval}
              onValueChange={(value) => 
                onUpdateSettings({ 
                  rotationInterval: value as Household["rotation_interval"]
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="2-weeks">Every 2 Weeks</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="3-months">Every 3 Months</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-gray-500">
              {household.rotation_interval === "week" && "Weekly"}
              {household.rotation_interval === "2-weeks" && "Every 2 Weeks"}
              {household.rotation_interval === "month" && "Monthly"}
              {household.rotation_interval === "3-months" && "Every 3 Months"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
