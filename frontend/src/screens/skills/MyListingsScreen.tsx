import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useMyListingsQuery, useDeleteSkillMutation } from "@/redux/api/skillsApi";
import { Skill } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "MyListings">;

export function MyListingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { data: skills, isLoading } = useMyListingsQuery();
  const [deleteSkill] = useDeleteSkillMutation();

  const handleDelete = (skill: Skill) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${skill.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSkill(skill._id).unwrap();
            } catch {}
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* CTA */}
      <View style={[styles.ctaContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Button
          label="Create New Listing"
          onPress={() => navigation.navigate("CreateSkill")}
          icon={<Feather name="plus" size={18} color="#FFFFFF" />}
        />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={skills ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="📚"
              title="No listings yet"
              subtitle="Create your first skill listing to start getting bookings."
              action={
                <Button
                  label="Create Listing"
                  onPress={() => navigation.navigate("CreateSkill")}
                />
              }
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
              <ListingCard
                skill={item}
                onEdit={() => navigation.navigate("EditSkill", { skillId: item._id })}
                onDelete={() => handleDelete(item)}
              />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function ListingCard({ skill, onEdit, onDelete }: { skill: Skill; onEdit: () => void; onDelete: () => void }) {
  const { colors } = useTheme();
  const grad = categoryGradients[skill.category] ?? categoryGradients.development;

  return (
    <View
      style={[
        styles.card,
        getShadow(colors, "sm"),
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.cardAccent, { backgroundColor: grad.colors[0] }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View style={[styles.categoryBadge, { backgroundColor: grad.colors[0] + "18" }]}>
            <Text style={[typography.tiny, { color: grad.colors[0], textTransform: "capitalize" }]}>
              {skill.category}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: skill.isActive ? colors.success + "18" : colors.surfaceMuted }]}>
            <View style={[styles.statusDot, { backgroundColor: skill.isActive ? colors.success : colors.textMuted }]} />
            <Text style={[typography.tiny, { color: skill.isActive ? colors.success : colors.textMuted }]}>
              {skill.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={2}>
          {skill.title}
        </Text>

        <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={2}>
          {skill.description}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[typography.h4, { color: colors.primary }]}>
            {"$" + skill.hourlyPrice + "/hr"}
          </Text>
          <View style={styles.cardActions}>
            <Pressable
              onPress={onEdit}
              style={[styles.actionButton, { backgroundColor: colors.primaryMuted }]}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={[styles.actionButton, { backgroundColor: colors.danger + "15" }]}
            >
              <Feather name="trash-2" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Card
  card: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
