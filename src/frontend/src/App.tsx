import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  GraduationCap,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type FacultyRequest, FacultyRequestStatus } from "./backend.d";
import {
  useApprovedRequests,
  usePendingRequests,
  useRecordInTime,
  useRecordOutTime,
  useSubmitRequest,
  useUpdateRequestStatus,
} from "./hooks/useQueries";

type Role = "principal" | "faculty" | "security";
type View = "landing" | "login" | "dashboard";

function formatTime(ns: bigint | undefined): string {
  if (!ns) return "\u2014";
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function formatTiming(timing: bigint): string {
  return timing === 1n ? "1 Hour" : "2 Hours";
}

// Landing Page
function LandingPage({ onSelect }: { onSelect: (role: Role) => void }) {
  const roles: {
    role: Role;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      role: "principal",
      label: "Principal Login",
      icon: <Shield className="w-8 h-8" />,
      desc: "Manage faculty requests",
    },
    {
      role: "faculty",
      label: "Faculty Login",
      icon: <GraduationCap className="w-8 h-8" />,
      desc: "Submit leave requests",
    },
    {
      role: "security",
      label: "Security Login",
      icon: <Lock className="w-8 h-8" />,
      desc: "Track faculty movement",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col institution-gradient">
      <header className="pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-white tracking-wide"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sai Vidya Institute of Technology
        </h1>
        <div className="mt-3 mx-auto w-24 h-1 gold-accent rounded-full" />
        <p className="mt-4 text-white/80 font-light tracking-widest uppercase text-sm">
          Faculty Monitoring System
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {roles.map(({ role, label, icon, desc }, i) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.45, ease: "easeOut" }}
            >
              <button
                type="button"
                data-ocid={`landing.${role}_button`}
                onClick={() => onSelect(role)}
                className="w-full group card-hover bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {label}
                    </h2>
                    <p className="text-sm text-white/60 mt-1">{desc}</p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="py-4 text-center text-white/40 text-xs">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline text-white/50 hover:text-white/70"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

// Login Page
function LoginPage({
  role,
  onContinue,
  onBack,
}: {
  role: Role;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roleLabels: Record<Role, string> = {
    principal: "Principal Login",
    faculty: "Faculty Login",
    security: "Security Login",
  };

  const roleIcons: Record<Role, React.ReactNode> = {
    principal: <Shield className="w-6 h-6" />,
    faculty: <GraduationCap className="w-6 h-6" />,
    security: <Lock className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen flex flex-col institution-gradient">
      <header className="pt-8 pb-4 text-center">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sai Vidya Institute of Technology
        </h1>
        <p className="text-sm text-white/60 tracking-widest uppercase mt-1">
          Faculty Monitoring System
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="institution-gradient py-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                  {roleIcons[role]}
                </div>
              </div>
              <CardTitle
                className="text-white text-xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {roleLabels[role]}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Email ID
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-ocid="login.email_input"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground/80 text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-ocid="login.password_input"
                  className="h-11"
                />
              </div>

              <Button
                onClick={onContinue}
                data-ocid="login.submit_button"
                className="w-full h-11 text-base font-semibold institution-gradient text-white border-0 hover:opacity-90"
              >
                Continue
              </Button>

              <button
                type="button"
                onClick={onBack}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                &larr; Back to Home
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

// Principal Dashboard
function PrincipalDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: requests, isLoading, refetch } = usePendingRequests();
  const updateStatus = useUpdateRequestStatus();

  const handleApprove = async (id: bigint) => {
    try {
      await updateStatus.mutateAsync({
        requestId: id,
        status: FacultyRequestStatus.approved,
      });
      toast.success("Request approved and sent to Security");
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleDecline = async (id: bigint) => {
    try {
      await updateStatus.mutateAsync({
        requestId: id,
        status: FacultyRequestStatus.declined,
      });
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  return (
    <DashboardShell
      title="Requests from Faculty"
      icon={<Shield className="w-6 h-6" />}
      roleName="Principal"
      onLogout={onLogout}
      onRefresh={() => refetch()}
    >
      {isLoading ? (
        <div className="space-y-4" data-ocid="principal.loading_state">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !requests?.length ? (
        <div
          data-ocid="principal.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No pending requests</p>
          <p className="text-sm mt-1">
            All faculty requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="principal.list">
          <AnimatePresence>
            {requests.map((req: FacultyRequest, i: number) => (
              <motion.div
                key={req.id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`principal.item.${i + 1}`}
              >
                <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-base">
                            {req.facultyName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTiming(req.timing)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {req.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          Submitted: {formatTime(req.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(req.id)}
                          data-ocid={`principal.approve_button.${i + 1}`}
                          disabled={updateStatus.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleDecline(req.id)}
                          data-ocid={`principal.decline_button.${i + 1}`}
                          disabled={updateStatus.isPending}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </DashboardShell>
  );
}

// Faculty Dashboard
function FacultyDashboard({ onLogout }: { onLogout: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timing, setTiming] = useState<"1" | "2">("1");
  const submitRequest = useSubmitRequest();

  const handleSend = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await submitRequest.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        timing: BigInt(timing),
      });
      toast.success("Request submitted successfully!");
      setName("");
      setDescription("");
      setTiming("1");
    } catch {
      toast.error("Failed to submit request");
    }
  };

  return (
    <DashboardShell
      title="Submit Request"
      icon={<GraduationCap className="w-6 h-6" />}
      roleName="Faculty"
      onLogout={onLogout}
    >
      <div className="max-w-lg mx-auto">
        <Card className="shadow-sm border border-border/60">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="faculty-name" className="font-medium">
                Your Name
              </Label>
              <Input
                id="faculty-name"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="faculty.name_input"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty-desc" className="font-medium">
                Description
              </Label>
              <Textarea
                id="faculty-desc"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-ocid="faculty.description_input"
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Duration</Label>
              <Select
                value={timing}
                onValueChange={(v) => setTiming(v as "1" | "2")}
              >
                <SelectTrigger
                  data-ocid="faculty.timing_select"
                  className="h-11"
                >
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSend}
              disabled={submitRequest.isPending}
              data-ocid="faculty.submit_button"
              className="w-full h-11 text-base font-semibold institution-gradient text-white border-0 hover:opacity-90"
            >
              {submitRequest.isPending ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

// Security Dashboard
function SecurityDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: requests, isLoading, refetch } = useApprovedRequests();
  const recordOut = useRecordOutTime();
  const recordIn = useRecordInTime();

  const handleOut = async (id: bigint) => {
    try {
      await recordOut.mutateAsync(id);
      toast.success("Out time recorded");
    } catch {
      toast.error("Failed to record out time");
    }
  };

  const handleIn = async (id: bigint) => {
    try {
      await recordIn.mutateAsync(id);
      toast.success("In time recorded");
    } catch {
      toast.error("Failed to record in time");
    }
  };

  return (
    <DashboardShell
      title="Faculty Details"
      icon={<Lock className="w-6 h-6" />}
      roleName="Security"
      onLogout={onLogout}
      onRefresh={() => refetch()}
    >
      {isLoading ? (
        <div className="space-y-4" data-ocid="security.loading_state">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !requests?.length ? (
        <div
          data-ocid="security.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No approved requests</p>
          <p className="text-sm mt-1">
            Approved faculty requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="security.list">
          {requests.map((req: FacultyRequest, i: number) => (
            <motion.div
              key={req.id.toString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`security.item.${i + 1}`}
            >
              <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {req.facultyName}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTiming(req.timing)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {req.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Out Time
                        </p>
                        {req.outTime ? (
                          <p className="text-sm font-medium text-foreground">
                            {formatTime(req.outTime)}
                          </p>
                        ) : (
                          <Button
                            onClick={() => handleOut(req.id)}
                            data-ocid={`security.outtime_button.${i + 1}`}
                            disabled={recordOut.isPending}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Record Out Time
                          </Button>
                        )}
                      </div>

                      <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          In Time
                        </p>
                        {req.inTime ? (
                          <p className="text-sm font-medium text-foreground">
                            {formatTime(req.inTime)}
                          </p>
                        ) : (
                          <Button
                            onClick={() => handleIn(req.id)}
                            data-ocid={`security.intime_button.${i + 1}`}
                            disabled={recordIn.isPending}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Record In Time
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

// Dashboard Shell
function DashboardShell({
  title,
  icon,
  roleName,
  onLogout,
  onRefresh,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  roleName: string;
  onLogout: () => void;
  onRefresh?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="institution-gradient sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest">
              Sai Vidya Institute of Technology
            </p>
            <h1
              className="text-white font-bold text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Faculty Monitoring System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              {icon} <span className="ml-1">{roleName}</span>
            </Badge>
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl institution-gradient flex items-center justify-center text-white">
            {icon}
          </div>
          <h2
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h2>
        </div>
        {children}
      </main>
    </div>
  );
}

// Root App
export default function App() {
  const [view, setView] = useState<View>("landing");
  const [role, setRole] = useState<Role>("faculty");
  const queryClient = useQueryClient();

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setView("login");
  };

  const handleLogout = () => {
    queryClient.clear();
    setView("landing");
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onSelect={handleRoleSelect} />
          </motion.div>
        )}
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage
              role={role}
              onContinue={() => setView("dashboard")}
              onBack={() => setView("landing")}
            />
          </motion.div>
        )}
        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {role === "principal" && (
              <PrincipalDashboard onLogout={handleLogout} />
            )}
            {role === "faculty" && <FacultyDashboard onLogout={handleLogout} />}
            {role === "security" && (
              <SecurityDashboard onLogout={handleLogout} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
