import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarService, CalendarEvent } from '../../services/calendar.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    FullCalendarModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    locale: 'fr',
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this)
  };

  events: CalendarEvent[] = [];
  showEventDialog = false;
  selectedEvent: CalendarEvent | null = null;
  isNewEvent = false;

  newEvent: CalendarEvent = {
    title: '',
    description: '',
    event_type: 'other',
    start_date: '',
    end_date: '',
    all_day: false,
    location: '',
    color: '#3498db',
    is_completed: false
  };

  eventTypes = [
    { value: 'exam', label: '📝 Examen', color: '#e74c3c' },
    { value: 'revision', label: '📚 Révision', color: '#3498db' },
    { value: 'td', label: '✏️ TD', color: '#2ecc71' },
    { value: 'course', label: '🎓 Cours', color: '#f39c12' },
    { value: 'reminder', label: '🔔 Rappel', color: '#9b59b6' },
    { value: 'other', label: '📌 Autre', color: '#95a5a6' }
  ];

  constructor(
    private calendarService: CalendarService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    console.log('🔄 Chargement des événements...');
    this.calendarService.getEvents().subscribe({
      next: (response: any) => {
        console.log('📥 Événements reçus du backend:', response);
        
        // Gérer si la réponse est un objet avec results ou directement un tableau
        const events = Array.isArray(response) ? response : (response.results || []);
        console.log('📋 Événements après extraction:', events);
        
        this.events = events;
        
        const mappedEvents = events.map((event: CalendarEvent) => ({
          id: event.id?.toString(),
          title: event.title,
          start: event.start_date,
          end: event.end_date,
          allDay: event.all_day,
          backgroundColor: event.color || this.getColorByType(event.event_type),
          borderColor: event.color || this.getColorByType(event.event_type),
          extendedProps: {
            description: event.description,
            event_type: event.event_type,
            location: event.location,
            is_completed: event.is_completed
          }
        }));
        
        console.log('🗓️ Événements mappés pour FullCalendar:', mappedEvents);
        
        // Force la mise à jour du calendrier
        this.calendarOptions = {
          ...this.calendarOptions,
          events: mappedEvents
        };
      },
      error: (error) => {
        console.error('❌ Erreur chargement:', error);
        this.snackBar.open('Erreur lors du chargement des événements', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  handleDateClick(arg: any): void {
    this.isNewEvent = true;
    this.newEvent = {
      title: '',
      description: '',
      event_type: 'other',
      start_date: arg.dateStr,
      end_date: '',
      all_day: false,
      location: '',
      color: '#3498db',
      is_completed: false
    };
    this.showEventDialog = true;
  }

  handleEventClick(arg: EventClickArg): void {
    const eventId = parseInt(arg.event.id);
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      this.selectedEvent = event;
      this.newEvent = { ...event };
      this.isNewEvent = false;
      this.showEventDialog = true;
    }
  }

  handleEventDrop(info: any): void {
    const eventId = parseInt(info.event.id);
    const updatedEvent: CalendarEvent = {
      ...this.events.find(e => e.id === eventId)!,
      start_date: info.event.start.toISOString(),
      end_date: info.event.end ? info.event.end.toISOString() : ''
    };

    this.calendarService.updateEvent(eventId, updatedEvent).subscribe({
      next: () => {
        this.snackBar.open('Événement déplacé', 'Fermer', { duration: 2000 });
        this.loadEvents();
      },
      error: () => {
        info.revert();
        this.snackBar.open('Erreur lors du déplacement', 'Fermer', { duration: 3000 });
      }
    });
  }

  handleEventResize(info: any): void {
    const eventId = parseInt(info.event.id);
    const updatedEvent: CalendarEvent = {
      ...this.events.find(e => e.id === eventId)!,
      start_date: info.event.start.toISOString(),
      end_date: info.event.end ? info.event.end.toISOString() : ''
    };

    this.calendarService.updateEvent(eventId, updatedEvent).subscribe({
      next: () => {
        this.snackBar.open('Événement redimensionné', 'Fermer', { duration: 2000 });
        this.loadEvents();
      },
      error: () => {
        info.revert();
        this.snackBar.open('Erreur lors du redimensionnement', 'Fermer', { duration: 3000 });
      }
    });
  }

  saveEvent(): void {
    if (!this.newEvent.title) {
      this.snackBar.open('Le titre est obligatoire', 'Fermer', { duration: 3000 });
      return;
    }

    // Set color based on event type if not already set
    if (!this.newEvent.color) {
      this.newEvent.color = this.getColorByType(this.newEvent.event_type);
    }

    console.log('📤 Événement à créer:', this.newEvent);

    if (this.isNewEvent) {
      this.calendarService.createEvent(this.newEvent).subscribe({
        next: (response) => {
          console.log('✅ Réponse du backend:', response);
          this.snackBar.open('Événement créé', 'Fermer', { duration: 2000 });
          this.loadEvents();
          this.closeDialog();
        },
        error: (error) => {
          console.error('❌ Erreur création:', error);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
        }
      });
    } else if (this.selectedEvent?.id) {
      this.calendarService.updateEvent(this.selectedEvent.id, this.newEvent).subscribe({
        next: () => {
          this.snackBar.open('Événement modifié', 'Fermer', { duration: 2000 });
          this.loadEvents();
          this.closeDialog();
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          console.error('Error updating event:', error);
        }
      });
    }
  }

  deleteEvent(): void {
    if (this.selectedEvent?.id && confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.calendarService.deleteEvent(this.selectedEvent.id).subscribe({
        next: () => {
          this.snackBar.open('Événement supprimé', 'Fermer', { duration: 2000 });
          this.loadEvents();
          this.closeDialog();
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          console.error('Error deleting event:', error);
        }
      });
    }
  }

  closeDialog(): void {
    this.showEventDialog = false;
    this.selectedEvent = null;
    this.newEvent = {
      title: '',
      description: '',
      event_type: 'other',
      start_date: '',
      end_date: '',
      all_day: false,
      location: '',
      color: '#3498db',
      is_completed: false
    };
  }

  getColorByType(type: string): string {
    const eventType = this.eventTypes.find(t => t.value === type);
    return eventType?.color || '#95a5a6';
  }

  onEventTypeChange(): void {
    this.newEvent.color = this.getColorByType(this.newEvent.event_type);
  }

  createNewEvent(): void {
    const today = new Date().toISOString().split('T')[0];
    this.handleDateClick({ dateStr: today });
  }
}
