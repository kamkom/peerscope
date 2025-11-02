import React from "react";
import type { EventDto } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type EventCardProps = {
  event: EventDto;
};

function EventCard({ event }: EventCardProps) {
  const formattedDate = new Date(event.event_date ?? "").toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a href={`/dashboard/events/${event.id}`} className="block transition-transform hover:scale-105">
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="truncate">{event.title}</CardTitle>
          <CardDescription>Data zdarzenia: {formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">Uczestnicy</h4>
          <TooltipProvider>
            <div className="flex -space-x-2">
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
            </div>
          </TooltipProvider>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Utworzono: {new Date(event.created_at).toLocaleDateString("pl-PL")}
          </p>
        </CardFooter>
      </Card>
    </a>
  );
}

export default EventCard;
