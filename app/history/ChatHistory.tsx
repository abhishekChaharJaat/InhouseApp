// ChatHistory.js
import React, { useMemo, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// If you don't use Expo, change/remove this and the <Ionicons> below
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { history } from "@/app/data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatDateTime } from "../helpers";
import Topnav from "../navs/Topnav";

const ChatHistory = () => {
  const [query, setQuery] = useState("");

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
        let data = (history as any)?.[key] ?? [];

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
  }, [history, query]);

  const renderItem = ({ item }: any) => {
    const router = useRouter();
    const description = formatDateTime(item.created_at);
    const showBriefcase = item.is_shared;
    const showDoc = !item.is_shared && !!item.google_doc_id;

    return (
      <TouchableOpacity
        style={styles.row}
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
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

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
    padding: 14,
    marginVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2, // Android shadow
    borderBottomWidth: 1,

    borderColor: "#dbdadacc",
  },

  rowMain: {
    flexDirection: "column",
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
