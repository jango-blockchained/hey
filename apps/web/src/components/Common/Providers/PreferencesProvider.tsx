import { getAuthApiHeaders } from "@helpers/getAuthApiHeaders";
import getCurrentSession from "@helpers/getCurrentSession";
import { HEY_API_URL } from "@hey/data/constants";
import { Permission } from "@hey/data/permissions";
import getAllTokens from "@hey/helpers/api/getAllTokens";
import getPreferences from "@hey/helpers/api/getPreferences";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FC } from "react";
import { usePreferencesStore } from "src/store/non-persisted/usePreferencesStore";
import { useProfileStatus } from "src/store/non-persisted/useProfileStatus";
import { useAllowedTokensStore } from "src/store/persisted/useAllowedTokensStore";
import { useProfileThemeStore } from "src/store/persisted/useProfileThemeStore";
import { useRatesStore } from "src/store/persisted/useRatesStore";
import { useVerifiedMembersStore } from "src/store/persisted/useVerifiedMembersStore";

const PreferencesProvider: FC = () => {
  const { id: sessionProfileId } = getCurrentSession();
  const { setTheme } = useProfileThemeStore();
  const { setVerifiedMembers } = useVerifiedMembersStore();
  const { setAllowedTokens } = useAllowedTokensStore();
  const { setFiatRates } = useRatesStore();
  const {
    setAppIcon,
    setEmail,
    setEmailVerified,
    setHasDismissedOrMintedMembershipNft,
    setHighSignalNotificationFilter,
    setLoading: setPreferencesLoading
  } = usePreferencesStore();
  const { setStatus } = useProfileStatus();

  const getPreferencesData = async () => {
    setPreferencesLoading(true);
    const preferences = await getPreferences(getAuthApiHeaders());

    setHighSignalNotificationFilter(preferences.highSignalNotificationFilter);
    setAppIcon(preferences.appIcon);
    setEmail(preferences.email);
    setEmailVerified(preferences.emailVerified);
    setStatus({
      isCommentSuspended: preferences.permissions.includes(
        Permission.CommentSuspended
      ),
      isSuspended: preferences.permissions.includes(Permission.Suspended)
    });
    setHasDismissedOrMintedMembershipNft(
      preferences.hasDismissedOrMintedMembershipNft
    );
    setPreferencesLoading(false);
    setTheme({ fontStyle: preferences.theme?.fontStyle });

    return true;
  };

  const getVerifiedMembers = async () => {
    try {
      const response = await axios.get(`${HEY_API_URL}/misc/verified`);
      setVerifiedMembers(response.data.result || []);
      return true;
    } catch {
      return false;
    }
  };

  const getAllowedTokens = async () => {
    const tokens = await getAllTokens();
    setAllowedTokens(tokens);
    return tokens;
  };

  const getFiatRates = async () => {
    try {
      const response = await axios.get(`${HEY_API_URL}/lens/rate`);
      setFiatRates(response.data.result || []);
      return true;
    } catch {
      return false;
    }
  };

  useQuery({
    enabled: Boolean(sessionProfileId),
    queryFn: getPreferencesData,
    queryKey: ["getPreferences", sessionProfileId || ""]
  });
  useQuery({
    queryFn: getVerifiedMembers,
    queryKey: ["getVerifiedMembers"]
  });
  useQuery({
    queryFn: getAllowedTokens,
    queryKey: ["getAllowedTokens"]
  });
  useQuery({
    queryFn: getFiatRates,
    queryKey: ["getFiatRates"],
    refetchInterval: 10000
  });

  return null;
};

export default PreferencesProvider;
