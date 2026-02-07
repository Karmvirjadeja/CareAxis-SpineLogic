// client/src/components/ui/NotificationSheet.tsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  MessageCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Mail,
  Eye,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
// This is a minimal type mock. A full implementation would use the shared schema.
interface INotification {
  _id: string;
  recipientId: string;
  senderId: string;
  type:
    | "EDIT_REQUEST"
    | "EDIT_APPROVED"
    | "EDIT_REJECTED"
    | "NEW_ASSESSMENT"
    | "SYSTEM";
  referenceId: string;
  message: string;
  read: boolean;
  reason?: string;
  changes?: any;
  createdAt: string;
}

const getIcon = (type: INotification["type"]) => {
  switch (type) {
    case "EDIT_REQUEST":
      return <Edit3 className="w-5 h-5 text-yellow-600" />;
    case "EDIT_APPROVED":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "EDIT_REJECTED":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "NEW_ASSESSMENT":
      return <MessageCircle className="w-5 h-5 text-blue-600" />;
    default:
      return <Mail className="w-5 h-5 text-gray-500" />;
  }
};

const NotificationSheet: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch notifications, poll every 15s for fresh data
  const { data: notifications = [], isLoading } = useQuery<INotification[]>({
    queryKey: ["/api/assessments/notifications"],
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const responseMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "reject";
    }) =>
      apiRequest("POST", `/api/assessments/notifications/${id}/respond`, {
        action,
      }),
    onSuccess: () => {
      toast({ title: "Response Sent" });
      queryClient.invalidateQueries({
        queryKey: ["/api/assessments/notifications"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] }); // Invalidate patients to update statuses/data
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/assessments/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/assessments/notifications"],
      });
    },
  });

  const handleAction = (id: string, action: "approve" | "reject") => {
    responseMutation.mutate({ id, action });
  };

  const handleView = (notification: INotification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    if (notification.type === "EDIT_REQUEST" && user?.role !== "assistant") {
      // Doctor views the latest patient data for review
      setLocation(`/doctor/${notification.referenceId}`);
    } else {
      // Assistant views the result of an edit, or the assessment itself
      setLocation(`/assessment-history/${notification.referenceId}`);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white text-xs font-bold flex items-center justify-center">
              <span className="text-[8px] text-white">{unreadCount}</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-primary" />
            <span>Notifications ({unreadCount} unread)</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[90%] -mr-6 pr-6">
          <div className="space-y-4 pt-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`border rounded-lg p-4 ${
                    n.read ? "bg-gray-50" : "bg-white border-blue-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          n.read ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>

                      {/* Action buttons for Doctors on EDIT_REQUEST */}
                      {user?.role !== "assistant" &&
                        n.type === "EDIT_REQUEST" &&
                        !n.read && (
                          <div className="mt-3 space-x-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAction(n._id, "approve")}
                              disabled={responseMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(n._id, "reject")}
                              disabled={responseMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                      {/* View Button for other notifications/states */}
                      {(n.type !== "EDIT_REQUEST" ||
                        user?.role === "assistant") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => handleView(n)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {n.type === "EDIT_REQUEST"
                            ? "View Result"
                            : "View Report"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSheet;
