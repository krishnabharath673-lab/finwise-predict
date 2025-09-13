import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

const RecentTransactions = () => {
  const transactions = [
    {
      id: 1,
      description: "Grocery Store",
      amount: -85.50,
      category: "Food",
      date: "Today",
      type: "expense",
      aiCategory: true
    },
    {
      id: 2,
      description: "Freelance Payment",
      amount: 450.00,
      category: "Income",
      date: "Yesterday",
      type: "income",
      aiCategory: false
    },
    {
      id: 3,
      description: "Netflix Subscription",
      amount: -15.99,
      category: "Entertainment",
      date: "2 days ago",
      type: "expense",
      aiCategory: true
    },
    {
      id: 4,
      description: "Bus Pass",
      amount: -30.00,
      category: "Transport",
      date: "3 days ago",
      type: "expense",
      aiCategory: true
    },
    {
      id: 5,
      description: "Coffee Shop",
      amount: -6.75,
      category: "Food",
      date: "3 days ago",
      type: "expense",
      aiCategory: true
    },
    {
      id: 6,
      description: "Textbook Purchase",
      amount: -125.00,
      category: "Education",
      date: "1 week ago",
      type: "expense",
      aiCategory: true
    },
    {
      id: 7,
      description: "Part-time Job",
      amount: 280.00,
      category: "Income",
      date: "1 week ago",
      type: "income",
      aiCategory: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Food: "food",
      Transport: "transport",
      Entertainment: "entertainment",
      Shopping: "shopping",
      Education: "education",
      Utilities: "utilities",
      Income: "success"
    };
    return colors[category] || "muted";
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button size="sm" variant="outline">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {transaction.type === 'income' ? (
                  <ArrowDownRight className="h-4 w-4 text-success" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.date}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: `hsl(var(--${getCategoryColor(transaction.category)}))`,
                      color: `hsl(var(--${getCategoryColor(transaction.category)}))`
                    }}
                  >
                    {transaction.category}
                  </Badge>
                  {transaction.aiCategory && (
                    <Badge variant="secondary" className="text-xs">
                      AI
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">This month</span>
            <div className="flex gap-4">
              <span className="text-success font-medium">+$730.00 income</span>
              <span className="text-destructive font-medium">-$289.24 expenses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { RecentTransactions };