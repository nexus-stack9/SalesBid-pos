
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EntityFormProps<T extends z.ZodType> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'select';
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
  submitLabel?: string;
  isLoading?: boolean;
  layout?: 'single-column' | 'two-columns';
}

function EntityForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  fields,
  submitLabel = 'Save',
  isLoading = false,
  layout = 'single-column',
}: EntityFormProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: z.infer<T>) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    }
  };

  if (layout === 'two-columns') {
    // Split the fields into two columns
    const midpoint = Math.ceil(fields.length / 2);
    const leftFields = fields.slice(0, midpoint);
    const rightFields = fields.slice(midpoint);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {leftFields.map((field) => renderFormField(field, form))}
            </div>
            <div className="space-y-4">
              {rightFields.map((field) => renderFormField(field, form))}
            </div>
          </div>
          <Button type="submit" className="mt-6" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full">
        {fields.map((field) => renderFormField(field, form))}
        <Button type="submit" className="mt-6" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

function renderFormField(field: any, form: any) {
  return (
    <FormField
      key={field.name}
      control={form.control}
      name={field.name as any}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            {field.type === 'textarea' ? (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
              />
            ) : field.type === 'select' && field.options ? (
              <Select
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'date' ? (
              <Input
                {...formField}
                type="date"
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                {...formField}
                type={field.type}
                placeholder={field.placeholder}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default EntityForm;
