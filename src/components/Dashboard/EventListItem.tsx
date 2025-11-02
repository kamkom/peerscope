import React from "react";
import type { EventDto } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type EventListItemProps = {
  event: EventDto;
  onDelete?: (eventId: string) => void;
};

function EventListItem({ event, onDelete }: EventListItemProps) {
  const isAnalysisPending = event.analysis_status === "pending";

  const formattedDate = new Date(event.event_date ?? "").toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(event.id);
    }
  };

  const WrapperElement = isAnalysisPending ? "div" : "a";
  const wrapperProps = isAnalysisPending
    ? { className: "contents" }
    : {
        href: `/dashboard/events/${event.id}/edit`,
        className: "contents",
      };

  return (
    <div
      className={cn("rounded-lg p-4 transition-colors", {
        "hover:bg-muted/50": !isAnalysisPending,
        "cursor-not-allowed opacity-50": isAnalysisPending,
      })}
    >
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-4">
        <WrapperElement {...wrapperProps}>
          <div className="truncate">
            <p className="font-semibold">{event.title}</p>
            <p className="text-sm text-muted-foreground">
              Utworzono: {new Date(event.created_at).toLocaleDateString("pl-PL")}
            </p>
          </div>

          <div className="flex -space-x-2">
            <TooltipProvider>
              {event.participants.map((participant) => (
                <Tooltip key={participant.id}>
                  <TooltipTrigger>
                    <Avatar className="border-2 border-background">
                      <AvatarImage src={participant.avatar_url ?? ""} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{participant.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {event.participants.length === 0 && <p className="text-sm text-muted-foreground">Brak uczestników</p>}
            </TooltipProvider>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </WrapperElement>
        <div className="flex items-center justify-end gap-2">
          {event.analysis_status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Analiza zakończona</span>
            </div>
          )}
          {event.analysis_status === "pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analiza w trakcie</span>
            </div>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="w-9 px-0"
              onClick={handleDelete}
              disabled={isAnalysisPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventListItem;
