import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useSession, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SessionInfo {
  id: string;
  status: string;
  lastActiveAt: Date;
  expireAt: Date;
  abandonAt: Date;
  latestActivity?: {
    browserName?: string;
    browserVersion?: string;
    deviceType?: string;
    ipAddress?: string;
    city?: string;
    country?: string;
    isMobile?: boolean;
  };
}

export default function DeviceSessions() {
  const { user, isLoaded } = useUser();
  const { session: currentSession } = useSession();
  const { signOut } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const userSessions = await user.getSessions();
      const sessionList: SessionInfo[] = userSessions.map((s: any) => ({
        id: s.id,
        status: s.status,
        lastActiveAt: new Date(s.lastActiveAt),
        expireAt: new Date(s.expireAt),
        abandonAt: new Date(s.abandonAt),
        latestActivity: s.latestActivity
          ? {
              browserName: s.latestActivity.browserName,
              browserVersion: s.latestActivity.browserVersion,
              deviceType: s.latestActivity.deviceType,
              ipAddress: s.latestActivity.ipAddress,
              city: s.latestActivity.city,
              country: s.latestActivity.country,
              isMobile: s.latestActivity.isMobile,
            }
          : undefined,
      }));

      // Sort: current session first, then by last active
      sessionList.sort((a, b) => {
        if (a.id === currentSession?.id) return -1;
        if (b.id === currentSession?.id) return 1;
        return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
      });

      setSessions(sessionList);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      Alert.alert("Error", "Failed to load device sessions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchSessions();
    }
  }, [isLoaded, user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSessions();
  };

  const handleRevokeSession = (sessionId: string) => {
    const isCurrentSession = sessionId === currentSession?.id;

    Alert.alert(
      isCurrentSession ? "Sign Out" : "Revoke Session",
      isCurrentSession
        ? "Are you sure you want to sign out from this device?"
        : "Are you sure you want to sign out from this device? The user will need to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isCurrentSession ? "Sign Out" : "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              setRevokingSessionId(sessionId);

              if (isCurrentSession) {
                await signOut();
                router.replace("/");
              } else {
                const sessionToRevoke = sessions.find(
                  (s) => s.id === sessionId
                );
                if (sessionToRevoke) {
                  const userSessions = await user?.getSessions();
                  const targetSession = userSessions?.find(
                    (s: any) => s.id === sessionId
                  );
                  if (targetSession) {
                    await targetSession.revoke();
                    fetchSessions();
                    Alert.alert("Success", "Session revoked successfully");
                  }
                }
              }
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.errors?.[0]?.message || "Failed to revoke session"
              );
            } finally {
              setRevokingSessionId(null);
            }
          },
        },
      ]
    );
  };

  const handleRevokeAllOtherSessions = () => {
    const otherSessions = sessions.filter(
      (s) => s.id !== currentSession?.id && s.status === "active"
    );

    if (otherSessions.length === 0) {
      Alert.alert("No Other Sessions", "There are no other active sessions.");
      return;
    }

    Alert.alert(
      "Sign Out All Other Devices",
      `Are you sure you want to sign out from ${otherSessions.length} other device(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out All",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const userSessions = await user?.getSessions();

              for (const session of otherSessions) {
                const targetSession = userSessions?.find(
                  (s: any) => s.id === session.id
                );
                if (targetSession) {
                  await targetSession.revoke();
                }
              }

              fetchSessions();
              Alert.alert("Success", "All other sessions have been revoked");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.errors?.[0]?.message || "Failed to revoke sessions"
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (session: SessionInfo): keyof typeof Ionicons.glyphMap => {
    const activity = session.latestActivity;
    if (activity?.isMobile || activity?.deviceType === "mobile") {
      return "phone-portrait-outline";
    }
    if (activity?.deviceType === "tablet") {
      return "tablet-portrait-outline";
    }
    return "desktop-outline";
  };

  const getDeviceInfo = (session: SessionInfo): string => {
    const activity = session.latestActivity;
    if (!activity) return "Unknown device";

    const parts: string[] = [];
    if (activity.browserName) {
      parts.push(activity.browserName);
    }
    if (activity.deviceType) {
      parts.push(activity.deviceType);
    }

    return parts.length > 0 ? parts.join(" - ") : "Unknown device";
  };

  const getLocationInfo = (session: SessionInfo): string => {
    const activity = session.latestActivity;
    if (!activity) return "";

    const parts: string[] = [];
    if (activity.city) parts.push(activity.city);
    if (activity.country) parts.push(activity.country);

    return parts.length > 0 ? parts.join(", ") : "";
  };

  if (!isLoaded || isLoading) {
    return (
      <CustomSafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1b2b48" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Sessions</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F3C5A" />
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1b2b48" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Sessions</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#1F6FEB" />
            <Text style={styles.infoText}>
              These are the devices that are currently logged into your account.
              You can sign out from any device you don't recognize.
            </Text>
          </View>

          {/* Sessions List */}
          <View style={styles.sessionsList}>
            {sessions.map((session) => {
              const isCurrentSession = session.id === currentSession?.id;
              const isRevoking = revokingSessionId === session.id;

              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.deviceIconContainer}>
                      <Ionicons
                        name={getDeviceIcon(session)}
                        size={24}
                        color="#1b2b48"
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionTitleRow}>
                        <Text style={styles.deviceName}>
                          {getDeviceInfo(session)}
                        </Text>
                        {isCurrentSession && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>
                              This device
                            </Text>
                          </View>
                        )}
                      </View>
                      {getLocationInfo(session) ? (
                        <Text style={styles.locationText}>
                          {getLocationInfo(session)}
                        </Text>
                      ) : null}
                      <Text style={styles.lastActiveText}>
                        Last active: {formatLastActive(session.lastActiveAt)}
                      </Text>
                      {session.latestActivity?.ipAddress && (
                        <Text style={styles.ipText}>
                          IP: {session.latestActivity.ipAddress}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.revokeButton,
                      isCurrentSession && styles.signOutButton,
                    ]}
                    onPress={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                  >
                    {isRevoking ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Text
                        style={[
                          styles.revokeButtonText,
                          isCurrentSession && styles.signOutButtonText,
                        ]}
                      >
                        {isCurrentSession ? "Sign Out" : "Revoke"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Sign Out All Button */}
          {sessions.filter(
            (s) => s.id !== currentSession?.id && s.status === "active"
          ).length > 0 && (
            <TouchableOpacity
              style={styles.signOutAllButton}
              onPress={handleRevokeAllOtherSessions}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.signOutAllText}>
                Sign out from all other devices
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1b2b48",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: "row",
    gap: 12,
  },
  deviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1b2b48",
  },
  currentBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  lastActiveText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  ipText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  revokeButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  signOutButton: {
    borderColor: "#2F3C5A",
    backgroundColor: "#fff",
  },
  revokeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  signOutButtonText: {
    color: "#2F3C5A",
  },
  signOutAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  signOutAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
