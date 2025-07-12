"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Item {
  id: number;
  title: string;
  images?: string[];
  condition: string;
  points_value: number;
}

export default function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/items?mine=1", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-mint-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2 text-sky-700 hover:bg-sky-50">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <h1 className="text-4xl font-extrabold text-sky-700 mb-8 drop-shadow-sm">My Uploaded Items</h1>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white border-2 border-sky-50">
                  <div className="aspect-square relative">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg?height=300&width=300"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-sky-700 line-clamp-2">{item.title}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">{item.condition}</Badge>
                      <span className="text-sm font-medium text-mint-600">{item.points_value} points</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven't uploaded any items yet.</p>
            <Link href="/items/new" className="mt-4 inline-block">
              <Button>List your first item</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 