import { forwardRef } from 'react';

const MessageList = forwardRef(({ children }, ref) => (
  <div className="flex-1 overflow-y-auto bg-white px-4 py-4 dark:bg-gray-900" ref={ref}>
    {children}
  </div>
));

MessageList.displayName = 'MessageList';
export default MessageList;
