import { motion } from "framer-motion";
import {
  Stethoscope,
  Users,
  FileText,
  Clock,
  CheckCircle,
  UserCog,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";

interface WelcomeUser {
  _id: string;
  email: string;
  fullName: string;
  role: "assistant" | "doctor" | "masterDoctor";
  assignedDoctorId?: string;
  isActive: boolean;
}

interface WelcomeAnimationProps {
  user: WelcomeUser;
  stats?: {
    [key: string]: number;
  };
  onAnimationComplete?: () => void;
}

const roleConfig = {
  assistant: {
    icon: UserCog,
    title: "Assistant Dashboard",
    greeting: "Ready to help patients get the care they need!",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    statIcons: {
      patients: FileText,
      pending: Clock,
      completed: CheckCircle,
    },
  },
  doctor: {
    icon: Stethoscope,
    title: "Doctor Dashboard",
    greeting: "Ready to provide expert medical care and diagnoses!",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    statIcons: {
      assistants: Users,
      patients: FileText,
      pending: Clock,
      report: ClipboardList,
      completed: CheckCircle,
    },
  },
  masterDoctor: {
    icon: TrendingUp,
    title: "Master Doctor Dashboard",
    greeting: "Overseeing the entire medical operation!",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    statIcons: {
      doctors: Stethoscope,
      assistants: UserCog,
      patients: FileText,
      assessments: TrendingUp,
    },
  },
};

export function WelcomeAnimation({
  user,
  stats = {},
  onAnimationComplete,
}: WelcomeAnimationProps) {
  const config = roleConfig[user.role as keyof typeof roleConfig];
  const IconComponent = config.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  const statVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onAnimationComplete}
      className="mb-8"
    >
      <Card
        className={`${config.bgColor} ${config.borderColor} border-2 shadow-lg`}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            {/* Welcome Section */}
            <div className="flex items-center space-x-6">
              <motion.div
                variants={iconVariants}
                className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}
              >
                <IconComponent className={`w-10 h-10 ${config.color}`} />
              </motion.div>

              <div>
                <motion.div variants={itemVariants}>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {getCurrentTime()}, {user.fullName}!
                  </h1>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className="text-xl text-gray-600 mb-3">
                    Welcome to your {config.title}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className={`text-lg font-medium ${config.color}`}>
                    {config.greeting}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Stats Section */}
            {Object.keys(stats).length > 0 && (
              <motion.div variants={itemVariants} className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(stats)
                    .slice(0, 4)
                    .map(([key, value], index) => {
                      const StatIcon =
                        config.statIcons[
                          key as keyof typeof config.statIcons
                        ] || FileText;

                      return (
                        <motion.div
                          key={key}
                          variants={statVariants}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-4 shadow-sm border min-w-[120px]"
                        >
                          <div className="flex items-center space-x-3">
                            <StatIcon className={`w-6 h-6 ${config.color}`} />
                            <div>
                              <p className="text-2xl font-bold text-gray-900">
                                {value}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Role Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center justify-between"
          >
            <Badge
              className={`${config.color} bg-white border-2 px-4 py-2 text-sm font-medium shadow-sm`}
            >
              {user.role === "masterDoctor"
                ? "Master Doctor"
                : user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
              Role
            </Badge>

            <motion.div
              variants={itemVariants}
              className="text-sm text-gray-500"
            >
              Last login: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
