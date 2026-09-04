using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;

namespace MsNhuFastEnglishAPI.Shared;

public static class UsernameHelper
{
    public static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        var result = stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        result = result.Replace('đ', 'd').Replace('Đ', 'D');
        return result;
    }

    public static async Task<string> GenerateUniqueUsernameAsync(AppDbContext db, string fullName)
    {
        var unsignedName = RemoveDiacritics(fullName).ToLower();
        var parts = unsignedName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "user_" + Guid.NewGuid().ToString("N")[..8];

        string baseUsername;
        if (parts.Length == 1)
        {
            baseUsername = parts[0];
        }
        else
        {
            var firstName = parts[^1];
            var initials = new StringBuilder();
            for (int i = parts.Length - 2; i >= 0; i--)
            {
                initials.Append(parts[i][0]);
            }
            baseUsername = firstName + initials.ToString();
        }

        // Keep only alphanumeric characters
        baseUsername = new string(baseUsername.Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrEmpty(baseUsername)) baseUsername = "user";

        var currentUsername = baseUsername;
        int counter = 0;
        while (await db.Users.AnyAsync(u => u.Username == currentUsername))
        {
            counter++;
            currentUsername = $"{baseUsername}{counter:D2}";
        }

        return currentUsername;
    }
}
