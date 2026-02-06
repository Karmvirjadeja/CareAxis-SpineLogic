// client/src/pages/user-management.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.jsx";
import { Input } from "../components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
import { useToast } from "../hooks/use-toast.js";
import { apiRequest } from "../lib/queryClient.js";
import { userSchema, User } from "../../shared/schema.js";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const createUserSchema = userSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: user?.role === "doctor" ? "assistant" : "doctor",
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const doctors = users.filter((u) => u.role === "doctor");
  const masterDoctors = users.filter((u) => u.role === "masterDoctor");

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserForm) =>
      apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      toast({ title: "User Created Successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "User Creation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    if (user?.role === "doctor") {
      data.assignedDoctorId = user._id;
    }
    if (user?.role === "masterDoctor" && data.role === "doctor") {
      data.assignedMasterDoctorId = user._id;
    }
    createUserMutation.mutate(data);
  };

  const role = form.watch("role");

  return (
    <ProtectedRoute allowedRoles={["masterDoctor", "doctor"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={user?.role === "doctor"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {user?.role === "masterDoctor" && (
                            <SelectItem value="doctor">Doctor</SelectItem>
                          )}
                          <SelectItem value="assistant">Assistant</SelectItem>
                          {user?.role === "masterDoctor" && (
                            <SelectItem value="masterDoctor">
                              Master Doctor
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === "assistant" && user?.role === "masterDoctor" && (
                  <FormField
                    control={form.control}
                    name="assignedDoctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Doctor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor._id} value={doctor._id!}>
                                {doctor.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {role === "doctor" && user?.role === "masterDoctor" && (
                  <FormField
                    control={form.control}
                    name="assignedMasterDoctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Master Doctor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a master doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterDoctors.map((master) => (
                              <SelectItem key={master._id} value={master._id!}>
                                {master.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
