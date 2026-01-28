import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useProfiles } from '@/hooks/useProfiles';
import { useLabels } from '@/hooks/useLabels';
import { useCycles } from '@/hooks/useCycles';
import { PRIORITIES, STATUSES, PRIORITY_CONFIG, STATUS_CONFIG, type IssueFilters, type IssuePriority, type IssueStatus } from '@/types/issue';

interface FilterBarProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { data: profiles } = useProfiles();
  const { data: labels } = useLabels();
  const { data: cycles } = useCycles();

  const activeFilterCount = [
    filters.status?.length,
    filters.priority?.length,
    filters.assignee_id ? 1 : 0,
    filters.cycle_id ? 1 : 0,
    filters.label_ids?.length,
  ].reduce((sum, count) => sum + (count || 0), 0);

  const toggleStatus = (status: IssueStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated.length ? updated : undefined });
  };

  const togglePriority = (priority: IssuePriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priority: updated.length ? updated : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-2 p-4 border-b">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {STATUSES.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status?.includes(status) || false}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <div className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[status].color)} />
                      {STATUS_CONFIG[status].label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority Filter */}
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PRIORITIES.map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filters.priority?.includes(priority) || false}
                      onCheckedChange={() => togglePriority(priority)}
                    />
                    <label
                      htmlFor={`priority-${priority}`}
                      className="text-sm flex items-center gap-1 cursor-pointer"
                    >
                      {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Assignee Filter */}
            <div>
              <Label className="text-sm font-medium">Assignee</Label>
              <Select
                value={filters.assignee_id || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    assignee_id: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Cycle Filter */}
            <div>
              <Label className="text-sm font-medium">Cycle</Label>
              <Select
                value={filters.cycle_id || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    cycle_id: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All cycles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cycles</SelectItem>
                  {cycles?.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {filters.status?.map((status) => (
        <Badge key={status} variant="secondary" className="gap-1">
          {STATUS_CONFIG[status].label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => toggleStatus(status)}
          />
        </Badge>
      ))}

      {filters.priority?.map((priority) => (
        <Badge key={priority} variant="secondary" className="gap-1">
          {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => togglePriority(priority)}
          />
        </Badge>
      ))}

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      )}
    </div>
  );
}
