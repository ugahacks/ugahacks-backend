export type TeamConfrimResponse = {
    member: {
        email: string, 
        confirmed: boolean,
    }[],
};