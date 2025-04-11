import { useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, SlidersHorizontal, ArrowUpDown, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AllocationChart from "@/components/dashboard/allocation-chart";
import PortfolioChart from "@/components/dashboard/portfolio-chart";

interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  quantity: string;
  price: string;
  value: string;
  change: string;
  color: string;
}

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  
  // Sample portfolio assets
  const assets: Asset[] = [
    {
      id: 1,
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "Stock",
      quantity: "15",
      price: "$187.32",
      value: "$2,809.80",
      change: "+0.8%",
      color: "#0050C8",
    },
    {
      id: 2,
      symbol: "MSFT",
      name: "Microsoft Corp",
      type: "Stock",
      quantity: "10",
      price: "$328.79",
      value: "$3,287.90",
      change: "+1.2%",
      color: "#0050C8",
    },
    {
      id: 3,
      symbol: "ETH",
      name: "Ethereum",
      type: "Cryptocurrency",
      quantity: "1.45",
      price: "$2,486.24",
      value: "$3,605.05",
      change: "+5.3%",
      color: "#10B981",
    },
    {
      id: 4,
      symbol: "BTC",
      name: "Bitcoin",
      type: "Cryptocurrency",
      quantity: "0.12",
      price: "$38,245.16",
      value: "$4,589.42",
      change: "+2.1%",
      color: "#10B981",
    },
    {
      id: 5,
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      type: "Stock",
      quantity: "8",
      price: "$142.65",
      value: "$1,141.20",
      change: "-0.3%",
      color: "#0050C8",
    },
    {
      id: 6,
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      type: "Stock",
      quantity: "5",
      price: "$178.12",
      value: "$890.60",
      change: "+1.5%",
      color: "#0050C8",
    },
    {
      id: 7,
      symbol: "GOVT",
      name: "iShares US Treasury",
      type: "Bond",
      quantity: "50",
      price: "$22.86",
      value: "$1,143.00",
      change: "-0.1%",
      color: "#F59E0B",
    },
    {
      id: 8,
      symbol: "CASH",
      name: "Cash Balance",
      type: "Cash",
      quantity: "-",
      price: "-",
      value: "$3,441.34",
      change: "0.0%",
      color: "#94A3B8",
    },
  ];
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortField) return 0;
    
    let compareA: string | number = a[sortField as keyof Asset];
    let compareB: string | number = b[sortField as keyof Asset];
    
    // If the values are prices or values, strip the currency symbol and convert to number
    if (typeof compareA === "string" && compareA.startsWith("$")) {
      compareA = parseFloat(compareA.replace("$", "").replace(",", ""));
      compareB = parseFloat((compareB as string).replace("$", "").replace(",", ""));
    }
    
    // If the values are percentages, strip the % symbol and convert to number
    if (typeof compareA === "string" && compareA.endsWith("%")) {
      compareA = parseFloat(compareA.replace("%", ""));
      compareB = parseFloat((compareB as string).replace("%", ""));
    }
    
    if (compareA < compareB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (compareA > compareB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  
  return (
    <>
      <Helmet>
        <title>Portfolio | ProfitWise AI</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-col">
          <Header />
          
          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
                <p className="text-slate-500">Manage and track your investments</p>
              </div>
              <Button onClick={() => setIsAddAssetDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <PortfolioChart className="lg:col-span-2" />
                  <AllocationChart />
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold">Portfolio Summary</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Search assets..." className="pl-9 pr-4" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Symbol</TableHead>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>
                              <div 
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSort("quantity")}
                              >
                                Quantity
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div 
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSort("price")}
                              >
                                Price
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div 
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSort("value")}
                              >
                                Value
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div 
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSort("change")}
                              >
                                Change
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAssets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.symbol}</TableCell>
                              <TableCell>{asset.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-2" 
                                    style={{ backgroundColor: asset.color }}
                                  ></div>
                                  {asset.type}
                                </div>
                              </TableCell>
                              <TableCell>{asset.quantity}</TableCell>
                              <TableCell>{asset.price}</TableCell>
                              <TableCell className="font-medium">{asset.value}</TableCell>
                              <TableCell className={asset.change.startsWith("+") ? "text-success" : asset.change.startsWith("-") ? "text-error" : ""}>
                                {asset.change}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Assets Tab */}
              <TabsContent value="assets" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4">Asset Details</h2>
                    <p>Detailed view of your assets with advanced filtering options.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4">Performance Analytics</h2>
                    <p>Advanced analytics on your portfolio performance over time.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      
      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetDialogOpen} onOpenChange={setIsAddAssetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="asset-symbol" className="text-sm font-medium block mb-1">Symbol</label>
              <Input id="asset-symbol" placeholder="e.g. AAPL, BTC" />
            </div>
            <div>
              <label htmlFor="asset-type" className="text-sm font-medium block mb-1">Asset Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="bond">Bond</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="asset-quantity" className="text-sm font-medium block mb-1">Quantity</label>
              <Input id="asset-quantity" type="number" placeholder="Number of units" />
            </div>
            <div>
              <label htmlFor="asset-price" className="text-sm font-medium block mb-1">Purchase Price</label>
              <Input id="asset-price" type="number" placeholder="Price per unit" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddAssetDialogOpen(false)}>Cancel</Button>
              <Button>Add Asset</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
