FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MsNhuFastEnglishAPI/MsNhuFastEnglishAPI.csproj", "MsNhuFastEnglishAPI/"]
RUN dotnet restore "MsNhuFastEnglishAPI/MsNhuFastEnglishAPI.csproj"
COPY . .
WORKDIR "/src/MsNhuFastEnglishAPI"
RUN dotnet publish "MsNhuFastEnglishAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "MsNhuFastEnglishAPI.dll"]
