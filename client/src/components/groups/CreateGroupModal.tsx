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
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { formatDateForInput } from '@/lib/date';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Group name must be at least 3 characters' }),
  description: z.string().optional(),
  goalDate: z.date({ required_error: 'Please select a target date' })
    .refine((date) => date > new Date(), {
      message: 'Target date must be in the future',
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      goalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to one month from now
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // This would be replaced with a real API call in a full implementation
      // await apiRequest('/api/groups', 'POST', values);
      
      // Mock successful creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Success!',
        description: `Group "${values.name}" has been created.`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the group. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to collaborate on tasks with others.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Study Group" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="A brief description of the group's purpose" 
                      className="resize-none h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Goal Completion Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDateForInput(field.value)
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}