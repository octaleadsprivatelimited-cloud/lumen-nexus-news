import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLastPing, useManualPing } from '@/hooks/usePingStatus';
import { formatDistanceToNow, format } from 'date-fns';
import { Activity, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const PingStatusCard = () => {
  const { data: lastPing, isLoading } = useLastPing();
  const { mutate: triggerPing, isPending } = useManualPing();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isHealthy = lastPing?.status === 'success';
  const timeSinceLastPing = lastPing?.pinged_at
    ? formatDistanceToNow(new Date(lastPing.pinged_at), { addSuffix: true })
    : 'Never';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Backend Status
          </CardTitle>
          <CardDescription>Keep-alive ping status</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerPing()}
          disabled={isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Ping Now
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : lastPing ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : (
              <Clock className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <Badge variant={isHealthy ? 'default' : lastPing ? 'destructive' : 'secondary'}>
                {isHealthy ? 'Healthy' : lastPing ? 'Error' : 'No Data'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Last ping: {timeSinceLastPing}
              </p>
            </div>
          </div>
          
          {lastPing && (
            <div className="text-right text-sm">
              {lastPing.response_time_ms && (
                <p className="font-medium">{lastPing.response_time_ms}ms</p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(new Date(lastPing.pinged_at), 'MMM d, HH:mm')}
              </p>
            </div>
          )}
        </div>
        
        {lastPing?.error_message && (
          <p className="text-xs text-destructive mt-2 truncate">
            Error: {lastPing.error_message}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PingStatusCard;
