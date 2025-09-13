import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Calendar } from "lucide-react";

const GoalProgress = () => {
  const goals = [
    {
      id: 1,
      title: "Emergency Fund",
      target: 5000,
      current: 2847,
      deadline: "Dec 2024",
      category: "Savings",
      progress: 57,
      monthlyContribution: 250
    },
    {
      id: 2,
      title: "New Laptop",
      target: 1500,
      current: 650,
      deadline: "Aug 2024",
      category: "Purchase",
      progress: 43,
      monthlyContribution: 200
    },
    {
      id: 3,
      title: "Summer Vacation",
      target: 2000,
      current: 1200,
      deadline: "Jun 2024",
      category: "Travel",
      progress: 60,
      monthlyContribution: 300
    },
    {
      id: 4,
      title: "Course Certification",
      target: 800,
      current: 320,
      deadline: "Sep 2024",
      category: "Education",
      progress: 40,
      monthlyContribution: 100
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 50) return "bg-info";
    return "bg-warning";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Savings": return "default";
      case "Purchase": return "secondary";
      case "Travel": return "outline";
      case "Education": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Financial Goals
        </CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{goal.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {goal.deadline}
                  <Badge variant={getCategoryColor(goal.category)} className="text-xs">
                    {goal.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${goal.current.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  of ${goal.target.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.progress}% complete</span>
                <span>${goal.target - goal.current} remaining</span>
              </div>
              <Progress 
                value={goal.progress} 
                className="h-3"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Monthly: ${goal.monthlyContribution}
              </span>
              <span className="text-success font-medium">
                {Math.ceil((goal.target - goal.current) / goal.monthlyContribution)} months left
              </span>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Goals Progress</span>
            <div className="text-right">
              <div className="font-bold">$5,017 / $9,300</div>
              <div className="text-sm text-success">54% complete</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { GoalProgress };