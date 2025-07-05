import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import api from "@/utils/api";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    academicYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    castes: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    hostelYears: ['2025-2026', '2026-2027', '2027-2028'],
    roomTypes: ['2 Person Sharing', '3 Person Sharing']
  });

  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/api/admin/settings')
      .then(res => setSettings(res.data))
      .catch(error => {
        console.error('Failed to fetch settings:', error);
      });
  }, []);

  const saveSettings = async (updatedSettings: typeof settings, onSuccess?: () => void) => {
    setIsSaving(true);
    try {
      await api.post('/api/admin/settings', updatedSettings);
      setSettings(updatedSettings);
      toast({ title: "Settings Saved", description: "Settings have been updated successfully." });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (category: keyof typeof settings, value: string) => {
    if (!value.trim()) return;
    const updatedSettings = {
      ...settings,
      [category]: [...settings[category], value.trim()]
    };
    saveSettings(updatedSettings, () => {
    toast({
      title: "Item Added",
      description: `${value} has been added to ${category}.`,
      });
    });
  };

  const removeItem = (category: keyof typeof settings, index: number) => {
    const updatedSettings = {
      ...settings,
      [category]: settings[category].filter((_, i) => i !== index)
    };
    saveSettings(updatedSettings);
    toast({
      title: "Item Removed",
      description: "Item has been removed successfully.",
    });
  };

  const SettingSection = ({ 
    title, 
    category, 
    items, 
    placeholder, 
    addItem, 
    removeItem 
  }: {
    title: string;
    category: keyof typeof settings;
    items: string[];
    placeholder: string;
    addItem: (category: keyof typeof settings, value: string) => void;
    removeItem: (category: keyof typeof settings, index: number) => void;
  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      if (!inputValue.trim()) return;
      addItem(category, inputValue);
      setInputValue('');
    };

    return (
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                    handleAdd();
                }
              }}
            />
            <Button 
                onClick={handleAdd}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  };

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
          placeholder="Enter academic year (e.g., Fifth Year)"
          addItem={addItem}
          removeItem={removeItem}
        />

        <SettingSection
          title="Year of Admission"
          category="admissionYears"
          items={settings.admissionYears || []}
          placeholder="Enter year of admission (e.g., 2025)"
          addItem={addItem}
          removeItem={removeItem}
        />

        <SettingSection
          title="Branches/Departments"
          category="branches"
          items={settings.branches}
          placeholder="Enter branch name"
          addItem={addItem}
          removeItem={removeItem}
        />

        <SettingSection
          title="Caste/Categories"
          category="castes"
          items={settings.castes}
          placeholder="Enter caste/category"
          addItem={addItem}
          removeItem={removeItem}
        />

        <SettingSection
          title="Hostel Years"
          category="hostelYears"
          items={settings.hostelYears}
          placeholder="Enter hostel year (e.g., 2028-2029)"
          addItem={addItem}
          removeItem={removeItem}
        />

        <SettingSection
          title="Room Types"
          category="roomTypes"
          items={settings.roomTypes}
          placeholder="Enter room type (e.g., 4 Person Sharing)"
          addItem={addItem}
          removeItem={removeItem}
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