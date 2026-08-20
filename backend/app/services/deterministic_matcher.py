"""
Service module for deterministic / rule-based keyword matching.
Used to compute objective match facts like exact skill matches.
"""

from typing import List, Dict, Any

class DeterministicMatcher:
    """Helper class to evaluate candidate keyword alignments deterministically."""

    @staticmethod
    def match_skills(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        """
        Compare candidate skills with required job skills deterministically.
        Args:
            candidate_skills (List[str]): List of parsed candidate skills.
            required_skills (List[str]): List of required skills from the job description.
        Returns:
            Dict: Matched and missing skill structures with exact evidence lists.
        """
        candidate_set = {skill.lower().strip() for skill in candidate_skills}
        matched = []
        missing = []

        for req in required_skills:
            req_clean = req.lower().strip()
            if req_clean in candidate_set:
                matched.append(req)
            else:
                missing.append(req)

        return {
            "matched_skills": matched,
            "missing_skills": missing,
            "match_ratio": len(matched) / len(required_skills) if required_skills else 0.0
        }
