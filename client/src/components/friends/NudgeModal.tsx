import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: User & { progress?: number };
}

const formSchema = z.object({
  messageType: z.string(),
  customMessage: z.string().optional().nullable(),
});

const presetMessages = [
  { id: 'reminder', label: 'Reminder', message: "Don't forget about your pending tasks!" },
  { id: 'encouragement', label: 'Encouragement', message: "You're doing great! Keep up the good work." },
  { id: 'question', label: 'Question', message: "How's your progress going? Need any help?" },
  { id: 'meetup', label: 'Meetup', message: "Want to schedule a productivity session together?" },
  { id: 'custom', label: 'Custom Message', message: "" },
];

export function NudgeModal({ isOpen, onClose, friend }: NudgeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      messageType: 'reminder',
      customMessage: '',
    },
  });
  
  const messageType = form.watch('messageType');
  const showCustomField = messageType === 'custom';
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Get the message text based on selection
    const messageText = showCustomField 
      ? values.customMessage 
      : presetMessages.find(m => m.id === values.messageType)?.message || '';
    
    try {
      // In a real implementation, we would send the message to the backend
      // await apiRequest(`/api/friends/${friend.id}/nudge`, 'POST', { message: messageText });
      
      // For now, simulate a successful message send
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Message sent!',
        description: `Your message has been sent to ${friend.name}.`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send the message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send a Nudge</DialogTitle>
          <DialogDescription>
            Send a message to {friend.name} to encourage or remind them.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{friend.name}</h3>
            <p className="text-sm text-gray-500">{friend.email}</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="messageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a message type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {presetMessages.map(message => (
                        <SelectItem key={message.id} value={message.id}>
                          {message.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!showCustomField && messageType && (
              <div className="bg-gray-50 p-3 rounded-md text-gray-700 border border-gray-200">
                {presetMessages.find(m => m.id === messageType)?.message}
              </div>
            )}
            
            {showCustomField && (
              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here..."
                        className="resize-none h-24"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}