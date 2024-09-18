import { StarIcon } from "@heroicons/react/24/solid";
import getPro from "@hey/helpers/api/getPro";
import { Tooltip } from "@hey/ui";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

interface ProProps {
  id: string;
}

const Pro: FC<ProProps> = ({ id }) => {
  const { data } = useQuery({
    queryFn: () => getPro(id),
    queryKey: ["getProForProfile", id]
  });

  if (!data?.isPro) {
    return null;
  }

  return (
    <Tooltip content="Pro">
      <StarIcon className="size-6 text-yellow-500" />
    </Tooltip>
  );
};

export default Pro;
