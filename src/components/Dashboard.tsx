import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseChart } from "./ExpenseChart";
import { BudgetOverview } from "./BudgetOverview";
import { GoalProgress } from "./GoalProgress";
import { RecentTransactions } from "./RecentTransactions";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Target, CreditCard } from "lucide-react";

const Dashboard = () => {
  const totalBalance = 2847.32;
  const monthlyIncome = 1500.00;
  const monthlyExpenses = 1243.67;
  const savingsGoal = 5000;
  const currentSavings = 2847.32;
  
  const budgetAlerts = [
    { category: "Food", spent: 385, budget: 300, percentage: 128 },
    { category: "Entertainment", spent: 185, budget: 200, percentage: 93 }
  ];

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground">Track your expenses, budgets, and financial goals</p>
          </div>
          <Button className="bg-gradient-primary shadow-medium">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Alerts */}
        {budgetAlerts.length > 0 && (
          <Card className="border-warning/20 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Budget Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budgetAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="font-medium">{alert.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ${alert.spent} / ${alert.budget}
                    </span>
                    <Badge variant={alert.percentage > 100 ? "destructive" : "secondary"}>
                      {alert.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">${monthlyIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From various sources</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">${monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                -3.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {Math.round((currentSavings / savingsGoal) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                ${currentSavings.toLocaleString()} of ${savingsGoal.toLocaleString()} goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart />
          <BudgetOverview />
        </div>

        {/* Goals and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalProgress />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;