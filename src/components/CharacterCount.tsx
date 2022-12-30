const CharacterCount: React.FC<{
  limit: number;
  value: string;
}> = ({ limit, value }) => {
  return (
    <em className={`${(value.length ?? 0) > limit ? "text-red-600" : ""}`}>
      ({value.length ?? "0"}/{limit} characters)
    </em>
  );
};

export default CharacterCount;
