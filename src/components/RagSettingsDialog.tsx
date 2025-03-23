
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { RagSettings } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RagSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate?: (settings: RagSettings) => void;
}

export function RagSettingsDialog({ open, onOpenChange, onSettingsUpdate }: RagSettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<RagSettings>({
    defaultValues: {
      chunk_size: 1000,
      chunk_overlap: 200,
      retrieval_k: 4,
      temperature: 0,
      model: 'gpt-3.5-turbo-0125',
    },
  });
  
  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (open) {
        setLoading(true);
        try {
          const response = await api.getRagSettings();
          if (response.success && response.data) {
            form.reset(response.data);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load RAG settings.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error fetching RAG settings:', error);
          toast({
            title: 'Error',
            description: 'Failed to load RAG settings.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSettings();
  }, [open, form, toast]);
  
  const onSubmit = async (data: RagSettings) => {
    setLoading(true);
    try {
      const response = await api.updateRagSettings(data);
      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: 'RAG settings updated successfully.',
        });
        if (onSettingsUpdate) {
          onSettingsUpdate(response.data);
        }
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update RAG settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating RAG settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update RAG settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>RAG Settings</DialogTitle>
          <DialogDescription>
            Configure the Retrieval-Augmented Generation settings for your documents.
            Changes may require reprocessing documents for optimal results.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="chunk_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chunk Size</FormLabel>
                  <FormDescription>
                    Size of text chunks for processing (100-8000)
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={100}
                        max={8000}
                        step={100}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="chunk_overlap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chunk Overlap</FormLabel>
                  <FormDescription>
                    Overlap between chunks to maintain context (0-500)
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={0}
                        max={500}
                        step={10}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="retrieval_k"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retrieved Chunks</FormLabel>
                  <FormDescription>
                    Number of chunks to retrieve per query (1-20)
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={1}
                        max={20}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature</FormLabel>
                  <FormDescription>
                    Controls randomness in responses (0-2)
                  </FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI Model</FormLabel>
                  <FormDescription>
                    The model to use for generating responses
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo-0125">GPT-3.5 Turbo (Latest)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
