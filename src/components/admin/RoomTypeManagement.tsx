import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [newRoomType, setNewRoomType] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Fetch room types from backend
  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/dropdowns/room-types`);
      setRoomTypes(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch room types.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchRoomTypes(); }, []);

  const handleAddRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomType.name) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/room-type`, { name: newRoomType.name });
      toast({ title: "Room Type Added", description: `${newRoomType.name} has been added successfully.` });
      setNewRoomType({ name: "" });
      setIsAdding(false);
      fetchRoomTypes();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add room type.", variant: "destructive" });
    }
  };

  const handleDeleteRoomType = async (id: string) => {
    if (!window.confirm("Delete this room type?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/room-type/${id}`);
      toast({ title: "Room Type Removed", description: "Room type has been removed successfully." });
      fetchRoomTypes();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete room type.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Room Type Management</span>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room Type
            </Button>
          </CardTitle>
          <CardDescription>
            Manage room types that are part of the hostel system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddRoomType} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="room-type-name">Room Type Name</Label>
                  <Input
                    id="room-type-name"
                    value={newRoomType.name}
                    onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                    placeholder="Enter room type name"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add Room Type
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((roomType) => (
                  <TableRow key={roomType._id}>
                    <TableCell className="font-medium">{roomType.name}</TableCell>
                    <TableCell>{new Date(roomType.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRoomType(roomType._id)}
                          className="text-hostel-danger hover:text-hostel-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomTypeManagement; 