import { Button } from "@mui/material";

interface ButtonAtomProps {
  text: string;
  onClickFunc: () => void;
  color:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "error"
    | "inherit"
    | "warning";
  variant: "outlined" | "contained" | "text";
}

const ButtonAtom: React.FC<ButtonAtomProps> = ({
  text,
  onClickFunc,
  color,
  variant,
}) => {
  return (
    <div>
      <Button onClick={onClickFunc} color={color} variant={variant}>
        {text}
      </Button>
    </div>
  );
};

export default ButtonAtom;
