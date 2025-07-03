import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    academicYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    castes: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    hostelYears: ['2025-2026', '2026-2027', '2027-2028'],
    roomTypes: ['2 Person Sharing', '3 Person Sharing']
  });

  const [newItems, setNewItems] = useState({
    academicYear: '',
    branch: '',
    caste: '',
    hostelYear: '',
    roomType: ''
  });

  const { toast } = useToast();

  const addItem = (category: keyof typeof settings, value: string) => {
    if (!value.trim()) return;
    
    const updatedSettings = {
      ...settings,
      [category]: [...settings[category], value.trim()]
    };
    
    setSettings(updatedSettings);
    setNewItems({...newItems, [category.replace('s', '') as keyof typeof newItems]: ''});
    
    toast({
      title: "Item Added",
      description: `${value} has been added to ${category}.`,
    });
  };

  const removeItem = (category: keyof typeof settings, index: number) => {
    const updatedSettings = {
      ...settings,
      [category]: settings[category].filter((_, i) => i !== index)
    };
    
    setSettings(updatedSettings);
    
    toast({
      title: "Item Removed",
      description: "Item has been removed successfully.",
    });
  };

  const SettingSection = ({ 
    title, 
    category, 
    items, 
    newValue, 
    onChange, 
    placeholder 
  }: {
    title: string;
    category: keyof typeof settings;
    items: string[];
    newValue: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Manage available {title.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(category, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={newValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(category, newValue);
                }
              }}
            />
            <Button 
              onClick={() => addItem(category, newValue)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>System Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure dropdown options and system settings
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingSection
          title="Academic Years"
          category="academicYears"
          items={settings.academicYears}
          newValue={newItems.academicYear}
          onChange={(value) => setNewItems({...newItems, academicYear: value})}
          placeholder="Enter academic year (e.g., Fifth Year)"
        />

        <SettingSection
          title="Branches/Departments"
          category="branches"
          items={settings.branches}
          newValue={newItems.branch}
          onChange={(value) => setNewItems({...newItems, branch: value})}
          placeholder="Enter branch name"
        />

        <SettingSection
          title="Caste/Categories"
          category="castes"
          items={settings.castes}
          newValue={newItems.caste}
          onChange={(value) => setNewItems({...newItems, caste: value})}
          placeholder="Enter caste/category"
        />

        <SettingSection
          title="Hostel Years"
          category="hostelYears"
          items={settings.hostelYears}
          newValue={newItems.hostelYear}
          onChange={(value) => setNewItems({...newItems, hostelYear: value})}
          placeholder="Enter hostel year (e.g., 2028-2029)"
        />

        <SettingSection
          title="Room Types"
          category="roomTypes"
          items={settings.roomTypes}
          newValue={newItems.roomType}
          onChange={(value) => setNewItems({...newItems, roomType: value})}
          placeholder="Enter room type (e.g., 4 Person Sharing)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>System Version: 1.0.0</div>
            <div>Last Updated: {new Date().toLocaleDateString()}</div>
            <div>Admin Email: admin@hostelhub.com</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;