import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  categories: Category[];
  activeCategories: string[];
  onToggleCategory: (categoryId: string) => void;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategories,
  onToggleCategory,
}) => {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategories.includes(category.id) &&
                styles.categoryButtonActive,
            ]}
            onPress={() => onToggleCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategories.includes(category.id) &&
                  styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoriesScrollView: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
  },
  categoryButtonActive: {
    backgroundColor: "#3366FF",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CategorySelector;
