import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  overlay: string;
  icon?: any;
  description?: string;
}

interface AnimatedCategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  layout?: "grid" | "horizontal";
  showCount?: boolean;
  showDescription?: boolean;
  maxColumns?: number;
}

export default function AnimatedCategorySelector({
  categories,
  selectedCategory,
  onCategorySelect,
  layout = "grid",
  showCount = true,
  showDescription = false,
  maxColumns = 6,
}: AnimatedCategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const getGridClasses = () => {
    if (layout === "horizontal") {
      return "flex flex-wrap justify-center gap-4";
    }

    const colClasses = {
      2: "grid-cols-2",
      3: "grid-cols-2 md:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
      5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    };

    return `grid ${colClasses[maxColumns] || colClasses[6]} gap-6 md:gap-8`;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex justify-center"
        >
          <div className={`${getGridClasses()} max-w-5xl w-full`}>
            <AnimatePresence>
              {categories.map((category, index) => {
                const isSelected = selectedCategory === category.id;
                const isHovered = hoveredCategory === category.id;

                return (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    layout
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-center group cursor-pointer relative ${
                      layout === "horizontal" ? "flex-shrink-0" : ""
                    }`}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onCategorySelect(category.id)}
                  >
                    {/* Selection Ring */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1 z-0"
                        />
                      )}
                    </AnimatePresence>

                    {/* Main Category Circle */}
                    <motion.div
                      className={`relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg transition-all duration-300 z-10 ${
                        isSelected
                          ? "ring-4 ring-white shadow-2xl"
                          : "group-hover:shadow-xl"
                      }`}
                      animate={{
                        boxShadow: isHovered
                          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <motion.img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: isHovered || isSelected ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Overlay */}
                      <motion.div
                        className={`absolute inset-0 ${category.overlay} transition-opacity duration-300`}
                        animate={{
                          opacity: isSelected ? 0.3 : isHovered ? 0.1 : 0.2,
                        }}
                      />

                      {/* Selected Check Mark */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
                          >
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <Check className="h-5 w-5 text-blue-600" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Category Name */}
                    <motion.div
                      className={`font-medium text-sm transition-all duration-300 ${
                        isSelected
                          ? "text-blue-600 font-semibold"
                          : "text-gray-800 group-hover:text-blue-600"
                      }`}
                      animate={{
                        scale: isSelected ? 1.05 : 1,
                      }}
                    >
                      {category.name}
                    </motion.div>

                    {/* Count Badge */}
                    {showCount && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="mt-1"
                      >
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className={`text-xs transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                          }`}
                        >
                          {category.count}개
                        </Badge>
                      </motion.div>
                    )}

                    {/* Description */}
                    {showDescription && category.description && (
                      <AnimatePresence>
                        {(isHovered || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-xs text-gray-500 overflow-hidden"
                          >
                            {category.description}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {/* Ripple Effect */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 2, opacity: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-400 rounded-full pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
