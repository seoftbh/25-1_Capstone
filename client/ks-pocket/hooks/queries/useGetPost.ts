import { getPostById } from "@/api/post";
import { useQuery } from "@tanstack/react-query";

function useGetPost (id: number) {
    return useQuery({
        queryFn: () => getPostById(Number(id)),
        queryKey: ["post", id],
        enabled: !!id,
    });
}