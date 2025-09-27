import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useMessages } from '../../contexts/MessageContext';
import { useAuth } from '../../contexts/AuthContext';

interface CategoryTabsProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onCategorySelect }) => {
  const { categories, addCategory, removeCategory } = useMessages();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  const handleAddCategory = () => {
    if (newCategoryName.trim() && user) {
      addCategory(newCategoryName.trim(), newCategoryColor, user.id);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setShowAddForm(false);
    }
  };

  const doctorCategories = categories.filter(cat => cat.doctorId === user?.id);

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {doctorCategories.map((category) => (
          <div key={category.id} className="flex items-center group">
            <button
              onClick={() => onCategorySelect(category.name.toLowerCase())}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors duration-200 border-b-2 flex items-center ${
                selectedCategory === category.name.toLowerCase()
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              ></div>
              {category.name}
            </button>
            {doctorCategories.length > 1 && (
              <button
                onClick={() => removeCategory(category.id)}
                className="ml-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        
        {/* Add Category Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-3 text-gray-400 hover:text-gray-600 border-b-2 border-transparent flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Add Category</span>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-3 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="flex space-x-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newCategoryColor === color ? 'border-gray-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;