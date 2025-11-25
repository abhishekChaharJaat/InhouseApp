// ChatHistory.js
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// If you don't use Expo, change/remove this and the <Ionicons> below
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import ThreadOptionsModal from "@/app/modals/thread-options-modal";
import { getAllThreads } from "@/store/threadSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../helpers";
import Topnav from "../navs/Topnav";

const ChatHistory = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { threads, loadingThreads, threadsError } = useSelector(
    (state: any) => state.thread
  );

  const sections = useMemo(() => {
    const labelMap = {
      today: "TODAY",
      yesterday: "YESTERDAY",
      previous_7_days: "PREVIOUS 7 DAYS",
      previous_30_days: "PREVIOUS 30 DAYS",
      older: "OLDER",
    };

    const bucketsOrder = [
      "today",
      "yesterday",
      "previous_7_days",
      "previous_30_days",
      "older",
    ];

    return bucketsOrder
      .map((key) => {
        let data = (threads as any)?.[key] ?? [];

        if (query.trim()) {
          const q = query.toLowerCase();
          data = data.filter((item: any) =>
            item.title.toLowerCase().includes(q)
          );
        }
        // ensure newest first
        data = [...data].sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return { title: (labelMap as any)[key], data };
      })
      .filter((section) => section.data.length > 0);
  }, [threads, query]);

  const renderItem = ({ item }: any) => {
    const router = useRouter();
    const description = formatDateTime(item.created_at);
    const showBriefcase = item.is_shared;
    const showDoc = !item.is_shared && !!item.google_doc_id;

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.rowContent}
          activeOpacity={0.7}
          onPress={() => router.push(`/chat/${item.id}` as any)}
        >
          <View style={styles.rowMain}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.title}>{item.title}</Text>

              {(showBriefcase || showDoc) && (
                <View style={styles.iconWrapper}>
                  {showBriefcase && (
                    <Ionicons name="briefcase-outline" size={14} />
                  )}
                  {showDoc && !showBriefcase && (
                    <Ionicons name="document-text-outline" size={14} />
                  )}
                </View>
              )}
            </View>

            <Text style={styles.subtitle}>{description}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.menuContainer}>
          <ThreadOptionsModal
            threadId={item.id}
            currentTitle={item.title}
            iconSize={20}
            iconColor="#666"
          />
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  if (loadingThreads) {
    return (
      <CustomSafeAreaView>
        <Topnav page="home" />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      </CustomSafeAreaView>
    );
  }

  if (threadsError) {
    return (
      <CustomSafeAreaView>
        <Topnav page="home" />
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load conversations</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              dispatch(getAllThreads() as any);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView>
      <Topnav page="home" />
      <View style={styles.container}>
        <Text style={styles.header}>Your History</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false} // 👈 hides scrollbar
        />
      </View>
    </CustomSafeAreaView>
  );
};

export default ChatHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#ffffff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "500",
    color: "#8a8a8a",
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginVertical: 4,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderColor: "#dbdadacc",
    backgroundColor: "#fff",
    // No shadow on Android
    elevation: 0,
    // iOS shadow (optional - remove if you don't want shadow on iOS either)
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
  rowContent: {
    flex: 1,
  },
  rowMain: {
    flexDirection: "column",
  },
  menuContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  iconWrapper: {
    marginLeft: 6,
    backgroundColor: "#fdf3db",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
});
