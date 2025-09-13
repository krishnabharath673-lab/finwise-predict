import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const BudgetOverview = () => {
  const budgets = [
    {
      category: "Food",
      spent: 385,
      budget: 300,
      color: "food",
      percentage: 128
    },
    {
      category: "Transport",
      spent: 120,
      budget: 150,
      color: "transport", 
      percentage: 80
    },
    {
      category: "Entertainment",
      spent: 185,
      budget: 200,
      color: "entertainment",
      percentage: 93
    },
    {
      category: "Shopping",
      spent: 220,
      budget: 250,
      color: "shopping",
      percentage: 88
    },
    {
      category: "Education",
      spent: 95,
      budget: 100,
      color: "education",
      percentage: 95
    },
    {
      category: "Utilities",
      spent: 150,
      budget: 180,
      color: "utilities",
      percentage: 83
    }
  ];

  const getBadgeVariant = (percentage: number) => {
    if (percentage > 100) return "destructive";
    if (percentage > 90) return "default";
    return "secondary";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-destructive";
    if (percentage > 90) return "bg-warning";
    return "bg-success";
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Overview</CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: `hsl(var(--${budget.color}))` }}
                />
                <span className="font-medium">{budget.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  ${budget.spent} / ${budget.budget}
                </span>
                <Badge variant={getBadgeVariant(budget.percentage)}>
                  {budget.percentage}%
                </Badge>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className="h-2"
              />
              {budget.percentage > 100 && (
                <div 
                  className="absolute top-0 left-0 h-2 bg-destructive rounded-full"
                  style={{ width: `${Math.min(budget.percentage, 150)}%` }}
                />
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Budget</span>
            <div className="text-right">
              <div className="font-bold">$1,155 / $1,180</div>
              <div className="text-sm text-muted-foreground">98% used</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { BudgetOverview };