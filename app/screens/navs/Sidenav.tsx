import { setShowContactHelp, setShowSidenav } from "@/app/store/homeSlice";
import { navigate } from "expo-router/build/global-state/routing";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// 👇 proper icons
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.8, 280);

export default function SideNav() {
  const [animation] = useState(new Animated.Value(0));
  const [showTaskMenu, setShowTaskMenu] = useState(false);

  const dispatch = useDispatch();
  const showSidenav = useSelector((state: any) => state.home.showSidenav);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: showSidenav ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [showSidenav]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  if (!showSidenav) return null;

  const closeAll = () => {
    setShowTaskMenu(false);
    dispatch(setShowSidenav(false));
  };

  const handleClick = (type: any) => {
    dispatch(setShowSidenav(false));
    switch (type) {
      case "ask_inhouse_ai": {
        setShowTaskMenu(false);
        navigate("/screens/home/Home");
        break;
      }
      case "chat-history": {
        navigate("/screens/history/ChatHistory");
        break;
      }
      case "chat-page": {
        navigate("/screens/chat/ChatPage");
        break;
      }
      case "contact_help": {
        dispatch(setShowContactHelp(true));
        break;
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark backdrop */}
      <Pressable style={styles.backdrop} onPress={closeAll} />

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* overlay inside drawer to close dropdown on any tap */}
        {showTaskMenu && (
          <Pressable
            style={styles.drawerOverlay}
            onPress={() => setShowTaskMenu(false)}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Inhouse</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Start New Task pill */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowTaskMenu((prev) => !prev)}
            activeOpacity={0.8}
          >
            <View style={styles.primaryLeft}>
              <View style={styles.primaryIconCircle}>
                {/* plus icon */}
                <Ionicons name="add" size={18} />
              </View>
              <Text style={styles.primaryText}>Start New Task</Text>
            </View>
            {/* optional chevron icon */}
            <Ionicons
              name={showTaskMenu ? "chevron-up" : "chevron-down"}
              size={18}
            />
          </TouchableOpacity>

          {/* Dropdown under Start New Task */}
          {showTaskMenu && (
            <View style={styles.taskMenu}>
              <TouchableOpacity
                style={styles.taskMenuItem}
                onPress={() => {
                  handleClick("ask_inhouse_ai");
                }}
              >
                {/* Chat icon */}
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  style={styles.taskMenuIcon}
                />
                <Text style={styles.taskMenuText}>Ask Inhouse AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskMenuItem}
                onPress={() => {
                  setShowTaskMenu(false);
                  // TODO: navigate to draft screen
                  // navigate("/screens/documents/DraftDocument");
                }}
              >
                {/* Document icon */}
                <MaterialIcons
                  name="description"
                  size={20}
                  style={styles.taskMenuIcon}
                />
                <Text style={styles.taskMenuText}>Draft Legal Document</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main menu items */}
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              {/* Folder icon */}
              <MaterialIcons name="folder" size={20} style={styles.menuIcon} />
              <Text style={styles.menuText}>Document Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleClick("chat-history")}
            >
              {/* History icon */}
              <MaterialIcons name="history" size={20} style={styles.menuIcon} />
              <Text style={styles.menuText}>Chat History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleClick("chat-page")}
            >
              {/* History icon */}
              <MaterialIcons name="history" size={20} style={styles.menuIcon} />
              <Text style={styles.menuText}>Chat Page</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            {/* Briefcase icon */}
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={20}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, styles.linkText]}>
              Contact Lawyer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClick("contact_help");
            }}
          >
            {/* Help / question icon */}
            <Ionicons
              name="help-circle-outline"
              size={20}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, styles.linkText]}>Contact Help</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#ffffff",
    paddingLeft: 10,
    paddingRight: 20,
    paddingVertical: 60,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    marginHorizontal: 10,
    zIndex: 2,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Content
  content: {
    flex: 1,
    zIndex: 2,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F6FB",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  primaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D2D7E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // dropdown styles
  taskMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignSelf: "flex-start",
    minWidth: 200,
    zIndex: 3,
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  taskMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  taskMenuIcon: {
    width: 22,
    textAlign: "center",
    marginRight: 10,
  },
  taskMenuText: {
    fontSize: 15,
  },

  menuSection: {
    paddingHorizontal: 4,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuIcon: {
    width: 22,
    textAlign: "center",
    marginRight: 10,
  },
  menuText: {
    fontSize: 15,
  },

  // Bottom actions
  bottomSection: {
    marginTop: "auto",
    zIndex: 2,
  },
  linkText: {
    color: "#003A81",
  },
});
