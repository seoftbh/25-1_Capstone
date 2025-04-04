import React, { useEffect } from "react";
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
  onInitCategories?: (categoryIds: string[]) => void; // 초기 카테고리 설정을 위한 prop 추가
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategories,
  onToggleCategory,
  onInitCategories,
}) => {
  // 컴포넌트 마운트 시 모든 카테고리 활성화
  useEffect(() => {
    // 모든 카테고리가 비활성화된 상태일 때만 초기화 함수 호출
    if (activeCategories.length === 0 && onInitCategories) {
      const allCategoryIds = categories.map(category => category.id);
      onInitCategories(allCategoryIds);
    }
  }, [categories, activeCategories.length, onInitCategories]);

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
