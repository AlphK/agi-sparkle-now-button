
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityAlertProps {
  type: 'warning' | 'info';
  title: string;
  message: string;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({ type, title, message }) => {
  return (
    <Alert variant={type === 'warning' ? 'destructive' : 'default'} className="mb-4">
      {type === 'warning' ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default SecurityAlert;
