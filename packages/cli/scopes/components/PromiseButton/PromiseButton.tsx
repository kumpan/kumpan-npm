import {
  type FC,
  type HTMLProps,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";

export type OnClickEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>;
export type OnClickHandler = HTMLProps<HTMLButtonElement>["onClick"];
export type OnErrorHandler = (error: unknown) => void;

export type PromiseButtonComponentProps = PropsWithChildren & {
  onClick?: OnClickHandler;
};

type PromiseButtonProps<Props extends PromiseButtonComponentProps> = {
  loading?: boolean;
  onClick?: OnClickHandler;
  onError?: OnErrorHandler;
  component: FC<Props & PropsWithChildren>;
  componentProps: Props;
  pendingComponent: ReactElement;
} & PropsWithChildren;

function isPromise(thing: unknown): thing is Promise<unknown> {
  return typeof thing === "object" && thing !== null && "then" in thing;
}

const useOnClickWrapper = (onClick?: OnClickHandler, onError?: OnErrorHandler) => {
  const [pending, setPending] = useState(false);
  const [rejected, setRejected] = useState(false);

  const onClickWrapper = useCallback(
    (event: OnClickEvent) => {
      if (!onClick) {
        return;
      }
      const result = onClick(event);
      if (isPromise(result)) {
        setPending(true);
        result
          .catch((e) => {
            setRejected(true);
            if (onError) {
              onError(e);
            } else {
              throw e;
            }
          })
          .finally(() => {
            setPending(false);
          });
      }
      return result;
    },
    [onClick, onError],
  );

  return { pending, rejected, onClickWrapper };
};

const PromiseButton = <Props extends PromiseButtonComponentProps>({
  loading = false,
  component: Component,
  componentProps,
  pendingComponent,
  onError,
  children,
}: PromiseButtonProps<Props>) => {
  const { pending, onClickWrapper } = useOnClickWrapper(componentProps.onClick, onError);

  const isLoading = useMemo(() => loading || pending, [loading, pending]);

  return (
    <Component {...componentProps} onClick={onClickWrapper}>
      <span
        style={{
          all: "inherit",
          border: "none",
          padding: 0,
          margin: 0,
          opacity: isLoading ? 0.3 : 1,
          boxShadow: "none",
          transition: "none",
        }}
      >
        {children}
      </span>

      <span
        aria-hidden={!isLoading}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          visibility: isLoading ? "visible" : "hidden",
        }}
      >
        {pendingComponent}
      </span>
    </Component>
  );
};

export default PromiseButton;
